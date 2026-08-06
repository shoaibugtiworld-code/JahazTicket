// Creates a Safepay checkout session and a pending booking record.
// The amount charged is ALWAYS recomputed here from Duffel's live offer +
// our markup, in PKR — never trusted from the browser. This is what makes
// "the price shown will not change" actually true and tamper-proof.
import { Safepay } from "@sfpy/node-sdk";
import { applyMarkup, getExchangeRate } from "../../../lib/pricing";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

const DUFFEL_OFFERS_URL = "https://api.duffel.com/air/offers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed, use POST" });
  }

  const { offerId, passengerId, passenger, contact } = req.body;
  if (!offerId || !passengerId || !passenger || !contact) {
    return res.status(400).json({ error: "offerId, passengerId, passenger and contact are all required" });
  }

  const duffelKey = process.env.DUFFEL_API_KEY;
  const safepayKey = process.env.SAFEPAY_API_KEY;
  const safepayV1Secret = process.env.SAFEPAY_V1_SECRET;
  const safepayWebhookSecret = process.env.SAFEPAY_WEBHOOK_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!duffelKey) return res.status(500).json({ error: "DUFFEL_API_KEY is not set." });
  if (!safepayKey) return res.status(500).json({ error: "SAFEPAY_API_KEY is not set." });
  if (!supabaseAdmin) return res.status(500).json({ error: "Supabase admin isn't configured." });
  if (!siteUrl) return res.status(500).json({ error: "NEXT_PUBLIC_SITE_URL is not set." });

  // 1. Re-fetch the offer fresh from Duffel — this is our only source of truth for price.
  let totalCurrency, totalAmount;
  try {
    const offerRes = await fetch(`${DUFFEL_OFFERS_URL}/${offerId}`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${duffelKey}`,
        "Duffel-Version": "v2",
      },
    });
    const offerData = await offerRes.json();
    if (!offerRes.ok) {
      return res.status(offerRes.status).json({ error: "Couldn't reload offer from Duffel", details: offerData });
    }
    totalCurrency = offerData.data?.total_currency;
    totalAmount = offerData.data?.total_amount;
    if (!totalCurrency || !totalAmount) {
      return res.status(400).json({ error: "This offer has expired — please search again." });
    }
  } catch (err) {
    return res.status(500).json({ error: "Server error reloading offer", details: err.message });
  }

  // 2. Convert to PKR and apply markup — Safepay settles in PKR, so the actual
  // charge is always in PKR regardless of what currency was shown at search time.
  const rate = await getExchangeRate(totalCurrency, "PKR");
  if (!rate) {
    return res.status(500).json({ error: "Couldn't get a PKR exchange rate right now — please try again." });
  }
  const amountPkr = parseFloat(applyMarkup(parseFloat(totalAmount) * rate));
  const amountInPaisa = Math.round(amountPkr * 100);

  // 3. Create a pending booking record — the webhook looks this up by id once
  // Safepay confirms payment, and uses it to actually book the ticket with Duffel.
  const { data: booking, error: dbError } = await supabaseAdmin
    .from("bookings")
    .insert({
      offer_id: offerId,
      passenger_id: passengerId,
      passenger: passenger,
      contact: contact,
      amount_pkr: amountPkr,
      status: "pending",
    })
    .select()
    .single();

  if (dbError) {
    return res.status(500).json({ error: "Couldn't create booking record", details: dbError.message });
  }

  // 4. Create the Safepay checkout session for this booking.
  try {
    const safepay = new Safepay({
      environment: process.env.SAFEPAY_ENV || "sandbox", // switch to "production" once verified live
      apiKey: safepayKey,
      v1Secret: safepayV1Secret,
      webhookSecret: safepayWebhookSecret,
    });

    const { token } = await safepay.payments.create({
      amount: amountInPaisa,
      currency: "PKR",
    });

    const checkoutUrl = safepay.checkout.create({
      token,
      orderId: booking.id,
      cancelUrl: `${siteUrl}/payment?status=cancelled`,
      redirectUrl: `${siteUrl}/confirmation?bookingId=${booking.id}`,
      source: "custom",
      webhooks: true,
    });

    return res.status(200).json({ checkoutUrl, bookingId: booking.id, amountPkr });
  } catch (err) {
    return res.status(500).json({ error: "Couldn't start Safepay checkout", details: err.message });
  }
}
