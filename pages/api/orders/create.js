// Manual/testing entry point. In the live flow, order creation actually
// happens automatically from the Safepay webhook (pages/api/payments/webhook.js)
// right after payment is confirmed — this route exists for direct testing only.
import { createDuffelOrder } from "../../../lib/duffelOrders";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed, use POST" });
  }

  const { offerId, passengerId, passenger } = req.body;
  if (!offerId || !passengerId || !passenger) {
    return res.status(400).json({
      error: "offerId, passengerId and passenger are all required",
    });
  }

  try {
    const order = await createDuffelOrder({ offerId, passengerId, passenger });
    return res.status(200).json(order);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
