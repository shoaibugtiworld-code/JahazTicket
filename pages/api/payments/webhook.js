// Safepay calls this URL automatically once a payment succeeds.
// This is the ONLY place where a Duffel ticket actually gets booked —
// it only runs after payment is verified, never before.
import { Safepay } from "@sfpy/node-sdk";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { createDuffelOrder } from "../../../lib/duffelOrders";

// Needed to verify the webhook signature against the exact raw request body —
// if Next.js parses the body first, the raw bytes needed for verification are lost.
export const config = {
  api: { bodyParser: false },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!supabaseAdmin) {
    return res.status(500).json({ error: "Supabase admin isn't configured." });
  }

  const rawBody = await readRawBody(req);
  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  // Verify this request genuinely came from Safepay before doing anything else.
  try {
    const safepay = new Safepay({
      environment: process.env.SAFEPAY_ENV || "sandbox",
      apiKey: process.env.SAFEPAY_API_KEY,
      v1Secret: process.env.SAFEPAY_V1_SECRET,
      webhookSecret: process.env.SAFEPAY_WEBHOOK_SECRET,
    });
    const valid = await safepay.verify.webhook({ headers: req.headers, body: rawBody });
    if (!valid) {
      return res.status(400).json({ error: "Invalid webhook signature" });
    }
  } catch (err) {
    return res.status(400).json({ error: "Webhook verification failed", details: err.message });
  }

  const bookingId = payload.orderId || payload.data?.tracker?.metadata?.order_id || payload.metadata?.order_id;
  const paymentSucceeded = payload.status === "paid" || payload.event === "payment.success" || payload.state === "TRACKER_ENDED";

  if (!bookingId) {
    return res.status(400).json({ error: "No booking reference in webhook payload" });
  }
  if (!paymentSucceeded) {
    // Not a success event (could be a cancel/fail notification) — acknowledge and stop.
    return res.status(200).json({ received: true, skipped: true });
  }

  const { data: booking, error: fetchError } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  if (booking.status === "booked") {
    // Already processed (webhooks can be sent more than once) — don't double-book.
    return res.status(200).json({ received: true, alreadyBooked: true });
  }

  await supabaseAdmin.from("bookings").update({ status: "paid" }).eq("id", bookingId);

  try {
    const order = await createDuffelOrder({
      offerId: booking.offer_id,
      passengerId: booking.passenger_id,
      passenger: booking.passenger,
    });

    await supabaseAdmin
      .from("bookings")
      .update({
        status: "booked",
        duffel_order_id: order.orderId,
        booking_reference: order.bookingReference,
      })
      .eq("id", bookingId);

    return res.status(200).json({ received: true, booked: true });
  } catch (err) {
    // Payment succeeded but Duffel booking failed — flag clearly for manual follow-up
    // rather than silently losing the customer's money without a ticket.
    await supabaseAdmin
      .from("bookings")
      .update({ status: "payment_received_booking_failed", error_message: err.message })
      .eq("id", bookingId);

    return res.status(200).json({ received: true, bookingFailed: true });
  }
}
