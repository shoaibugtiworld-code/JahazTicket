// This is a placeholder. Once you have Simpaisa/bSecure (or direct JazzCash/EasyPaisa)
// credentials, this route is where the real payment-session creation call goes:
// 1. Create a payment session/order with the aggregator using offer.finalPrice
// 2. Return a checkout URL or token to the frontend
// 3. On the aggregator's webhook/callback, verify signature, then call
//    pages/api/orders/create.js to actually book the Duffel offer and generate the PDF ticket.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed, use POST" });
  }

  const { method } = req.body;

  const aggregatorConfigured = Boolean(process.env.PAYMENT_AGGREGATOR_API_KEY);

  if (!aggregatorConfigured) {
    return res.status(200).json({
      status: "pending_integration",
      message: `Payment method "${method}" recognised, but no payment aggregator key is set yet.`,
    });
  }

  // TODO: replace with real aggregator call once PAYMENT_AGGREGATOR_API_KEY is set.
  return res.status(200).json({ status: "processing" });
}
