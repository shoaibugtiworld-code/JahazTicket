// Called AFTER payment has been confirmed (JazzCash/EasyPaisa/card/bank via your aggregator).
// This actually purchases the ticket from Duffel using your Duffel account balance,
// and returns the booking reference + ticket data needed to generate the PDF.
//
// IMPORTANT: Duffel needs your Duffel account to have enough balance to cover the
// base fare (not the marked-up price) — top up your Duffel balance from their dashboard.
// The customer's payment (via JazzCash/EasyPaisa/card) goes to YOUR bank account separately;
// "arranged_externally" tells Duffel you've already collected the money yourself.

const DUFFEL_ORDERS_URL = "https://api.duffel.com/air/orders";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed, use POST" });
  }

  const { offerId, passengerId, passenger } = req.body;
  if (!offerId || !passengerId || !passenger) {
    return res.status(400).json({ error: "offerId, passengerId and passenger details are required" });
  }

  const duffelKey = process.env.DUFFEL_API_KEY;
  if (!duffelKey) {
    return res.status(500).json({ error: "DUFFEL_API_KEY is not set." });
  }

  const [firstName, ...rest] = passenger.fullName.trim().split(" ");
  const lastName = rest.join(" ") || firstName;

  const payload = {
    data: {
      type: "instant",
      selected_offers: [offerId],
      payments: [
        {
          type: "arranged_externally",
        },
      ],
      passengers: [
        {
          id: passengerId, // must match the offer's passenger id from search
          title: passenger.gender === "female" ? "ms" : "mr",
          gender: passenger.gender === "female" ? "f" : "m",
          given_name: firstName,
          family_name: lastName,
          born_on: passenger.dob,
          email: passenger.email,
          phone_number: passenger.phone,
        },
      ],
    },
  };

  try {
    const duffelRes = await fetch(DUFFEL_ORDERS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${duffelKey}`,
        "Duffel-Version": "v2",
      },
      body: JSON.stringify(payload),
    });

    const data = await duffelRes.json();

    if (!duffelRes.ok) {
      return res.status(duffelRes.status).json({ error: "Booking failed", details: data });
    }

    return res.status(200).json({
      bookingReference: data.data?.booking_reference,
      orderId: data.data?.id,
      documents: data.data?.documents,
      passengers: data.data?.passengers,
      slices: data.data?.slices,
      totalAmount: data.data?.total_amount,
      currency: data.data?.total_currency,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
