// Server-side flight search — the ONLY place price math happens.
// The client never sees Duffel's raw price, only price + markup.
// This is what guarantees "jo price dikhega, wahi final price hoga".

const DUFFEL_API_URL = "https://api.duffel.com/air/offer_requests";
const MARKUP_PERCENT = Number(process.env.MARKUP_PERCENT || 10); // 10%

// Minimal country -> currency map for common markets. Falls back to USD.
const COUNTRY_CURRENCY = {
  PK: "PKR", US: "USD", GB: "GBP", AE: "AED", SA: "SAR",
  IN: "INR", CA: "CAD", AU: "AUD", DE: "EUR", FR: "EUR",
  QA: "QAR", OM: "OMR", BH: "BHD", KW: "KWD", TR: "TRY",
  CN: "CNY", TH: "THB", MY: "MYR",
};

async function getExchangeRate(fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return 1;
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
    const data = await res.json();
    return data?.rates?.[toCurrency] || null;
  } catch {
    return null;
  }
}

function applyMarkup(amount) {
  const base = parseFloat(amount);
  const withMarkup = base * (1 + MARKUP_PERCENT / 100);
  return withMarkup.toFixed(2);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed, use POST" });
  }

  const { slices: inputSlices, passengers: inputPassengers, cabinClass } = req.body;

  if (!Array.isArray(inputSlices) || inputSlices.length === 0) {
    return res.status(400).json({ error: "At least one flight segment (slice) is required" });
  }
  for (const s of inputSlices) {
    if (!s.origin || !s.destination || !s.date) {
      return res.status(400).json({ error: "Each segment needs origin, destination and date" });
    }
  }
  if (!Array.isArray(inputPassengers) || inputPassengers.length === 0) {
    return res.status(400).json({ error: "At least one passenger is required" });
  }

  const duffelKey = process.env.DUFFEL_API_KEY;
  if (!duffelKey) {
    return res.status(500).json({ error: "DUFFEL_API_KEY is not set. Check Vercel environment variables." });
  }

  const slices = inputSlices.map((s) => ({
    origin: s.origin,
    destination: s.destination,
    departure_date: s.date,
  }));

  const payload = {
    data: {
      slices,
      passengers: inputPassengers.map((p) => (p.age !== undefined ? { age: p.age } : { type: p.type })),
      cabin_class: cabinClass || "economy",
    },
  };

  try {
    const duffelRes = await fetch(`${DUFFEL_API_URL}?return_offers=true`, {
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
      return res.status(duffelRes.status).json({
        error: "Couldn't fetch flights from Duffel",
        details: data,
      });
    }

    const rawOffers = data.data?.offers || [];

    // Detect the visitor's country from Vercel's edge geolocation headers, map it to a
    // currency, and convert once — the same converted+marked-up price is then shown
    // through the whole checkout, it never gets recalculated later.
    const countryCode = req.headers["x-vercel-ip-country"] || "";
    const targetCurrency = COUNTRY_CURRENCY[countryCode] || null;
    const sourceCurrency = rawOffers[0]?.total_currency;
    const rate =
      targetCurrency && sourceCurrency ? await getExchangeRate(sourceCurrency, targetCurrency) : null;
    const displayCurrency = rate ? targetCurrency : sourceCurrency;

    const offers = rawOffers.map((offer) => {
      const amountInSourceCurrency = parseFloat(offer.total_amount);
      const amountInDisplayCurrency = rate ? amountInSourceCurrency * rate : amountInSourceCurrency;
      return {
        id: offer.id,
        airline: offer.owner?.name,
        airlineLogo: offer.owner?.logo_symbol_url,
        currency: displayCurrency,
        basePrice: offer.total_amount, // internal only — do not send to frontend in production
        finalPrice: applyMarkup(amountInDisplayCurrency),
        expiresAt: offer.expires_at,
        passengerIds: (offer.passengers || []).map((p) => p.id),
        legs: (offer.slices || []).map((slice) => ({
          originAirport: slice.origin?.iata_code,
          destinationAirport: slice.destination?.iata_code,
          departureDate: slice.segments?.[0]?.departing_at,
          arrivalDate: slice.segments?.[slice.segments.length - 1]?.arriving_at,
          stops: (slice.segments?.length || 1) - 1,
        })),
      };
    });

    // Sort cheapest-first so the lowest final price is always shown on top.
    offers.sort((a, b) => parseFloat(a.finalPrice) - parseFloat(b.finalPrice));

    // Strip basePrice before responding — frontend should only ever see finalPrice.
    const publicOffers = offers.map(({ basePrice, ...rest }) => rest);

    return res.status(200).json({ offers: publicOffers });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
