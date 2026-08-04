const DUFFEL_PLACES_URL = "https://api.duffel.com/places/suggestions";

export default async function handler(req, res) {
  const { query } = req.query;
  if (!query || query.trim().length < 2) {
    return res.status(200).json({ places: [] });
  }

  const duffelKey = process.env.DUFFEL_API_KEY;
  if (!duffelKey) {
    return res.status(500).json({ error: "DUFFEL_API_KEY is not set." });
  }

  try {
    const url = `${DUFFEL_PLACES_URL}?query=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${duffelKey}`,
        "Duffel-Version": "v2",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: "Duffel places lookup failed", details: data });
    }

    const places = (data.data || [])
      .filter((p) => p.iata_code) // only things you can actually search flights with
      .map((p) => ({
        iataCode: p.iata_code,
        name: p.name,
        cityName: p.city_name || p.city?.name || "",
        countryName: p.iata_country_code,
        type: p.type, // "airport" or "city"
      }));

    return res.status(200).json({ places });
  } catch (err) {
    return res.status(500).json({ error: "Server error fetching places", details: err.message });
  }
}
