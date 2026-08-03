import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

const TRIP_TYPES = ["One-way", "Round-trip", "Multi-city"];

function emptySegment() {
  return { origin: "", destination: "", date: "" };
}

export default function Home() {
  const router = useRouter();
  const [checkedSession, setCheckedSession] = useState(false);
  const [tripType, setTripType] = useState("One-way");

  // One-way / Round-trip fields
  const [origin, setOrigin] = useState("DEA");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  // Multi-city fields — starts with 2 segments, user can add more
  const [segments, setSegments] = useState([emptySegment(), emptySegment()]);

  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState("economy");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [offers, setOffers] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem("jt_session");
    if (!session) {
      router.replace("/login");
    } else {
      setCheckedSession(true);
    }
  }, [router]);

  const swap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const updateSegment = (index, field, value) => {
    setSegments((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addSegment = () => {
    setSegments((prev) => [...prev, emptySegment()]);
  };

  const removeSegment = (index) => {
    setSegments((prev) => prev.filter((_, i) => i !== index));
  };

  const buildSlices = () => {
    if (tripType === "One-way") {
      return [{ origin, destination, date: departureDate }];
    }
    if (tripType === "Round-trip") {
      return [
        { origin, destination, date: departureDate },
        { origin: destination, destination: origin, date: returnDate },
      ];
    }
    // Multi-city
    return segments.map((s) => ({ origin: s.origin, destination: s.destination, date: s.date }));
  };

  const validate = () => {
    if (tripType === "One-way") {
      if (!origin || !destination || !departureDate) return "Please fill in From, To and Departure Date";
    } else if (tripType === "Round-trip") {
      if (!origin || !destination || !departureDate || !returnDate)
        return "Please fill in From, To, Departure Date and Return Date";
    } else {
      if (segments.length < 2) return "Multi-city needs at least 2 flights";
      for (const s of segments) {
        if (!s.origin || !s.destination || !s.date) return "Please fill in every flight's From, To and Date";
      }
    }
    return null;
  };

  const searchFlights = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setLoading(true);
    setOffers(null);
    try {
      const res = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slices: buildSlices(),
          passengers,
          cabinClass,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setOffers(data.offers);
      }
    } catch (e) {
      setError("Couldn't reach the server");
    } finally {
      setLoading(false);
    }
  };

  if (!checkedSession) return null;

  return (
    <div className="min-h-screen bg-bg text-white pb-16">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5">
        <Logo />
        <button onClick={() => router.push("/login")} className="text-muted text-sm">
          Sign out
        </button>
      </div>
      <h1 className="px-4 text-xl font-bold mb-4">Flights Search</h1>

      {/* Trip type tabs */}
      <div className="flex gap-2 px-4 mb-4">
        {TRIP_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setTripType(type)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
              tripType === type
                ? "border-brand text-brand"
                : "border-cardline bg-card text-white"
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Search card */}
      <div className="mx-4 bg-card border border-cardline rounded-xl2 overflow-hidden relative">
        {tripType !== "Multi-city" ? (
          <>
            <div className="flex items-center gap-4 px-4 py-4 border-b border-cardline">
              <span className="text-xl">🛫</span>
              <div className="flex-1">
                <p className="text-muted text-xs">From</p>
                <input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                  placeholder="From"
                  className="bg-transparent font-bold text-lg outline-none w-full"
                />
              </div>
            </div>

            <button
              onClick={swap}
              className="absolute right-4 top-[52px] -translate-y-1/2 bg-bg border border-cardline rounded-full w-11 h-11 flex items-center justify-center"
            >
              ↕
            </button>

            <div className="flex items-center gap-4 px-4 py-4 border-b border-cardline">
              <span className="text-xl">🛬</span>
              <div className="flex-1">
                <p className="text-muted text-xs">To</p>
                <input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value.toUpperCase())}
                  placeholder="To"
                  className="bg-transparent font-bold text-lg outline-none w-full placeholder-muted"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 px-4 py-4 border-b border-cardline">
              <span className="text-xl">📅</span>
              <div className="flex-1">
                <p className="text-muted text-xs">Departure Date</p>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="bg-transparent font-bold text-lg outline-none w-full"
                />
              </div>
            </div>

            {tripType === "Round-trip" && (
              <div className="flex items-center gap-4 px-4 py-4 border-b border-cardline">
                <span className="text-xl">📅</span>
                <div className="flex-1">
                  <p className="text-muted text-xs">Return Date</p>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="bg-transparent font-bold text-lg outline-none w-full"
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="divide-y divide-cardline">
            {segments.map((seg, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                {segments.length > 2 && (
                  <button
                    onClick={() => removeSegment(i)}
                    className="w-6 h-6 rounded-full border border-cardline flex items-center justify-center text-xs shrink-0"
                  >
                    ✕
                  </button>
                )}
                <div className="flex-1">
                  <p className="text-muted text-xs">From</p>
                  <input
                    value={seg.origin}
                    onChange={(e) => updateSegment(i, "origin", e.target.value.toUpperCase())}
                    placeholder="..."
                    className="bg-transparent font-bold outline-none w-full"
                  />
                </div>
                <div className="flex-1 border-l border-cardline pl-3">
                  <p className="text-muted text-xs">To</p>
                  <input
                    value={seg.destination}
                    onChange={(e) => updateSegment(i, "destination", e.target.value.toUpperCase())}
                    placeholder="..."
                    className="bg-transparent font-bold outline-none w-full"
                  />
                </div>
                <div className="flex-1 border-l border-cardline pl-3">
                  <p className="text-muted text-xs">Date</p>
                  <input
                    type="date"
                    value={seg.date}
                    onChange={(e) => updateSegment(i, "date", e.target.value)}
                    className="bg-transparent font-bold outline-none w-full"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={addSegment}
              className="w-full flex items-center gap-2 px-4 py-3 text-brand font-semibold"
            >
              <span className="w-6 h-6 rounded-full bg-brand text-black flex items-center justify-center text-sm">
                +
              </span>
              Add one more flight
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 px-4 py-4 border-b border-cardline">
          <span className="text-xl">👪</span>
          <div className="flex-1">
            <p className="text-muted text-xs">Passengers &amp; Cabin Class</p>
            <div className="flex gap-3 mt-1">
              <input
                type="number"
                min={1}
                value={passengers}
                onChange={(e) => setPassengers(Number(e.target.value))}
                className="bg-transparent font-bold text-lg outline-none w-14"
              />
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
                className="bg-transparent font-bold text-lg outline-none"
              >
                <option value="economy">Economy</option>
                <option value="premium_economy">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 px-4 py-4">
          <span className="text-xl">💳</span>
          <div>
            <p className="text-muted text-xs mb-1">Payment Types</p>
            <p className="text-sm">Mastercard · Visa · EasyPaisa · JazzCash</p>
          </div>
        </div>
      </div>

      {/* Search button */}
      <div className="px-4 mt-6">
        <button
          onClick={searchFlights}
          disabled={loading}
          className="w-full bg-brand hover:bg-brandDark transition-colors rounded-full py-4 font-bold text-lg disabled:opacity-60"
        >
          {loading ? "Searching..." : "Search Flights"}
        </button>
      </div>

      {error && <p className="text-red-400 text-center mt-4 px-4">{error}</p>}

      {/* Results */}
      {offers && (
        <div className="px-4 mt-6 space-y-3">
          {offers.length === 0 && (
            <p className="text-muted text-center">No flights found on this route.</p>
          )}
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-card border border-cardline rounded-xl2 px-4 py-4"
            >
              <p className="font-bold mb-2">{offer.airline}</p>
              <div className="space-y-1 mb-3">
                {offer.legs.map((leg, i) => (
                  <p key={i} className="text-muted text-sm">
                    {leg.originAirport} → {leg.destinationAirport} ·{" "}
                    {leg.stops === 0 ? "Direct" : `${leg.stops} stop(s)`}
                  </p>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-brand font-bold text-lg">
                  {offer.currency} {offer.finalPrice}
                </p>
                <button
                  onClick={() => {
                    sessionStorage.setItem("jt_selected_offer", JSON.stringify(offer));
                    router.push("/booking");
                  }}
                  className="bg-brand hover:bg-brandDark transition-colors rounded-full px-4 py-1.5 text-sm font-semibold"
                >
                  Select
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Footer />
    </div>
  );
}
