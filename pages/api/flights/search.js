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

  const { origin, destination, departureDate, returnDate, passengers, cabinClass } = req.body;

  if (!origin || !destination || !departureDate) {
    return res.status(400).json({ error: "origin, destination and departureDate are required" });
  }

  const duffelKey = process.env.DUFFEL_API_KEY;
  if (!duffelKey) {
    return res.status(500).json({ error: "DUFFEL_API_KEY is not set. Check Vercel environment variables." });
  }

  const slices = [{ origin, destination, departure_date: departureDate }];
  if (returnDate) {
    slices.push({ origin: destination, destination: origin, departure_date: returnDate });
  }

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
      departureDate: offer.slices?.[0]?.segments?.[0]?.departing_at,
      arrivalDate:
        offer.slices?.[0]?.segments?.[offer.slices[0].segments.length - 1]?.arriving_at,
      originAirport: offer.slices?.[0]?.origin?.iata_code,
      destinationAirport: offer.slices?.[0]?.destination?.iata_code,
      stops: (offer.slices?.[0]?.segments?.length || 1) - 1,
      currency: offer.total_currency,
      basePrice: offer.total_amount, // internal only — do not send to frontend in production
      finalPrice: applyMarkup(offer.total_amount),
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
