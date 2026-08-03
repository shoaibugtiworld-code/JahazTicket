// Server-side flight search — the ONLY place price math happens.
// The client never sees Duffel's raw price, only price + markup.
// This is what guarantees "jo price dikhega, wahi final price hoga".

const DUFFEL_API_URL = "https://api.duffel.com/air/offer_requests";
const MARKUP_PERCENT = Number(process.env.MARKUP_PERCENT || 10); // 10%

function applyMarkup(amount) {
  const base = parseFloat(amount);
  const withMarkup = base * (1 + MARKUP_PERCENT / 100);
  return withMarkup.toFixed(2);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed, use POST" });
  }

  const { slices: inputSlices, passengers, cabinClass } = req.body;

  if (!Array.isArray(inputSlices) || inputSlices.length === 0) {
    return res.status(400).json({ error: "At least one flight segment (slice) is required" });
  }
  for (const s of inputSlices) {
    if (!s.origin || !s.destination || !s.date) {
      return res.status(400).json({ error: "Each segment needs origin, destination and date" });
    }
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
      passengers: Array.from({ length: passengers || 1 }, () => ({ type: "adult" })),
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

    const offers = (data.data?.offers || []).map((offer) => ({
      id: offer.id,
      airline: offer.owner?.name,
      airlineLogo: offer.owner?.logo_symbol_url,
      currency: offer.total_currency,
      basePrice: offer.total_amount, // internal only — do not send to frontend in production
      finalPrice: applyMarkup(offer.total_amount),
      passengerIds: (offer.passengers || []).map((p) => p.id),
      legs: (offer.slices || []).map((slice) => ({
        originAirport: slice.origin?.iata_code,
        destinationAirport: slice.destination?.iata_code,
        departureDate: slice.segments?.[0]?.departing_at,
        arrivalDate: slice.segments?.[slice.segments.length - 1]?.arriving_at,
        stops: (slice.segments?.length || 1) - 1,
      })),
    }));

    // Sort cheapest-first so the lowest final price is always shown on top.
    offers.sort((a, b) => parseFloat(a.finalPrice) - parseFloat(b.finalPrice));

    // Strip basePrice before responding — frontend should only ever see finalPrice.
    const publicOffers = offers.map(({ basePrice, ...rest }) => rest);

    return res.status(200).json({ offers: publicOffers });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
