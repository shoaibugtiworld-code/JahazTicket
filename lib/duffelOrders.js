const DUFFEL_ORDERS_URL = "https://api.duffel.com/air/orders";
const DUFFEL_OFFERS_URL = "https://api.duffel.com/air/offers";

// Actually purchases the ticket from Duffel using your Duffel account balance
// (topped up in advance). The customer's payment (via Safepay) goes to your
// bank account separately — the difference (your markup) is your profit.
// Duffel itself never sees or processes the customer's payment.
export async function createDuffelOrder({ offerId, passengerId, passenger }) {
  const duffelKey = process.env.DUFFEL_API_KEY;
  if (!duffelKey) {
    throw new Error("DUFFEL_API_KEY is not set.");
  }

  // Fetch the offer fresh from Duffel ourselves — never trust a stored amount.
  // This must match exactly what the "balance" payment declares.
  const offerRes = await fetch(`${DUFFEL_OFFERS_URL}/${offerId}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${duffelKey}`,
      "Duffel-Version": "v2",
    },
  });
  const offerData = await offerRes.json();
  if (!offerRes.ok) {
    throw new Error(`Couldn't reload offer from Duffel: ${JSON.stringify(offerData)}`);
  }
  const totalCurrency = offerData.data?.total_currency;
  const totalAmount = offerData.data?.total_amount;
  if (!totalCurrency || !totalAmount) {
    throw new Error("This offer has expired.");
  }

  const title = passenger.title
    ? passenger.title.toLowerCase()
    : passenger.gender === "female"
    ? "mrs"
    : "mr";

  const payload = {
    data: {
      selected_offers: [offerId],
      payments: [
        {
          type: "balance",
          currency: totalCurrency,
          amount: totalAmount,
        },
      ],
      passengers: [
        {
          id: passengerId,
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
    throw new Error(`Duffel booking failed: ${JSON.stringify(data)}`);
  }

  return {
    bookingReference: data.data?.booking_reference,
    orderId: data.data?.id,
    documents: data.data?.documents,
    passengers: data.data?.passengers,
    slices: data.data?.slices,
    totalAmount: data.data?.total_amount,
    currency: data.data?.total_currency,
  };
}
