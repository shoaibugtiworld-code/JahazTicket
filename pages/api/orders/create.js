// Called AFTER payment has been confirmed (JazzCash/EasyPaisa/card/bank via your aggregator).
// This actually purchases the ticket from Duffel using your Duffel account balance,
// and returns the booking reference + ticket data needed to generate the PDF.
//
// IMPORTANT: "balance" payment type means Duffel charges YOUR Duffel account balance
// (which you top up in advance) for the base fare. The customer's payment
// (via JazzCash/EasyPaisa/card) goes to YOUR bank account separately — the difference
// (your markup) is your profit. Duffel does not handle the customer's payment at all.

const DUFFEL_ORDERS_URL = "https://api.duffel.com/air/orders";
const DUFFEL_OFFERS_URL = "https://api.duffel.com/air/offers";

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

  const duffelKey = process.env.DUFFEL_API_KEY;
  if (!duffelKey) {
    return res.status(500).json({ error: "DUFFEL_API_KEY is not set." });
  }

  // Fetch the offer fresh from Duffel ourselves — never trust a currency/amount sent
  // from the browser. This is also what the "balance" payment must match exactly,
  // and it keeps our base price (and therefore our markup) from ever reaching the client.
  let totalCurrency;
  let totalAmount;
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

  const title = passenger.title ? passenger.title.toLowerCase() : (passenger.gender === "female" ? "mrs" : "mr");

  const payload = {
    data: {
      selected_offers: [offerId],
      payments: [
        {
          type: "balance",
          currency: totalCurrency, // must match the offer's total_currency exactly
          amount: totalAmount, // must match the offer's total_amount exactly (base fare, not your marked-up price)
        },
      ],
      passengers: [
        {
          id: passengerId, // must match the offer's passenger id from search
          title,
          gender: passenger.gender === "female" ? "f" : "m",
          given_name: passenger.givenName,
          family_name: passenger.surname,
          born_on: passenger.dob,
          email: passenger.email,
          phone_number: passenger.phone,
          identity_documents: [
            {
              type: "passport",
              unique_identifier: passenger.passportNumber,
              expires_on: passenger.passportExpiry,
              issuing_country_code: passenger.nationality,
            },
          ],
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
