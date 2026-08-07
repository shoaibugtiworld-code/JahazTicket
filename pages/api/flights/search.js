// Server-side flight search — the ONLY place price math happens.
// The client never sees Duffel's raw price, only price + markup.
// This is what guarantees "jo price dikhega, wahi final price hoga".
import { applyMarkup, getExchangeRate } from "../../../lib/pricing";

const DUFFEL_API_URL = "https://api.duffel.com/air/offer_requests";

// Country -> currency map covering every continent, so any visitor worldwide
// sees prices in their own local currency automatically. Falls back to the
// offer's native currency (usually USD) if a country isn't listed here.
const COUNTRY_CURRENCY = {
  // Middle East & South Asia
  PK: "PKR", IN: "INR", BD: "BDT", LK: "LKR", NP: "NPR", AF: "AFN",
  AE: "AED", SA: "SAR", QA: "QAR", OM: "OMR", BH: "BHD", KW: "KWD",
  JO: "JOD", LB: "LBP", IQ: "IQD", IR: "IRR", IL: "ILS", SY: "SYP", YE: "YER",
  // East & Southeast Asia
  CN: "CNY", JP: "JPY", KR: "KRW", HK: "HKD", TW: "TWD", SG: "SGD",
  MY: "MYR", TH: "THB", ID: "IDR", PH: "PHP", VN: "VND", KH: "KHR",
  LA: "LAK", MM: "MMK", MN: "MNT", MO: "MOP", BN: "BND",
  // Europe (EUR-zone + others)
  GB: "GBP", FR: "EUR", DE: "EUR", IT: "EUR", ES: "EUR", NL: "EUR",
  BE: "EUR", AT: "EUR", PT: "EUR", IE: "EUR", GR: "EUR", FI: "EUR",
  LU: "EUR", CY: "EUR", MT: "EUR", SK: "EUR", SI: "EUR", EE: "EUR",
  LV: "EUR", LT: "EUR", HR: "EUR",
  CH: "CHF", NO: "NOK", SE: "SEK", DK: "DKK", PL: "PLN", CZ: "CZK",
  HU: "HUF", RO: "RON", BG: "BGN", TR: "TRY", RU: "RUB", UA: "UAH",
  RS: "RSD", IS: "ISK", AL: "ALL", MK: "MKD", BA: "BAM", MD: "MDL",
  GE: "GEL", AM: "AMD", AZ: "AZN", KZ: "KZT", UZ: "UZS",
  // Americas
  US: "USD", CA: "CAD", MX: "MXN", BR: "BRL", AR: "ARS", CL: "CLP",
  CO: "COP", PE: "PEN", UY: "UYU", EC: "USD", PY: "PYG", BO: "BOB",
  VE: "VES", CR: "CRC", PA: "USD", GT: "GTQ", HN: "HNL", SV: "USD",
  NI: "NIO", DO: "DOP", JM: "JMD", TT: "TTD", BS: "BSD", BB: "BBD",
  // Africa
  EG: "EGP", ZA: "ZAR", NG: "NGN", KE: "KES", GH: "GHS", ET: "ETB",
  MA: "MAD", TN: "TND", DZ: "DZD", TZ: "TZS", UG: "UGX", RW: "RWF",
  ZM: "ZMW", ZW: "ZWL", MU: "MUR", SN: "XOF", CI: "XOF", CM: "XAF",
  // Oceania
  AU: "AUD", NZ: "NZD", FJ: "FJD", PG: "PGK",
};


// Converts Duffel's ISO 8601 duration ("PT2H15M") into "2h 15m"
function formatDuration(iso) {
  if (!iso) return null;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return null;
  const hours = match[1] ? `${match[1]}h` : "";
  const minutes = match[2] ? `${match[2]}m` : "";
  return [hours, minutes].filter(Boolean).join(" ") || null;
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
        legs: (offer.slices || []).map((slice) => {
          const segments = slice.segments || [];
          const firstSegment = segments[0];
          const lastSegment = segments[segments.length - 1];
          return {
            originAirport: slice.origin?.iata_code,
            originCity: slice.origin?.city_name || slice.origin?.name,
            destinationAirport: slice.destination?.iata_code,
            destinationCity: slice.destination?.city_name || slice.destination?.name,
            departureDate: firstSegment?.departing_at,
            arrivalDate: lastSegment?.arriving_at,
            stops: (segments.length || 1) - 1,
            duration: formatDuration(slice.duration),
            fareBrand: slice.fare_brand_name || null,
            flightNumbers: segments.map(
              (seg) => `${seg.marketing_carrier?.iata_code || ""}-${seg.marketing_carrier_flight_number || ""}`
            ),
          };
        }),
      };
    });

    // Sort cheapest-first so the lowest final price is always shown on top.
    offers.sort((a, b) => parseFloat(a.finalPrice) - parseFloat(b.finalPrice));

    // The same physical flight is often sold under several fare brands
    // (Economy Value, Classic, Flex...) which looks like duplicate/fake
    // results to a first-time visitor. Keep only the cheapest fare per
    // unique itinerary (same flight numbers on every leg).
    const seenItineraries = new Set();
    const dedupedOffers = offers.filter((offer) => {
      const key = offer.legs.map((leg) => leg.flightNumbers.join("+")).join("|");
      if (seenItineraries.has(key)) return false;
      seenItineraries.add(key);
      return true;
    });

    // Strip basePrice before responding — frontend should only ever see finalPrice.
    const publicOffers = dedupedOffers.map(({ basePrice, ...rest }) => rest);

    return res.status(200).json({ offers: publicOffers });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
