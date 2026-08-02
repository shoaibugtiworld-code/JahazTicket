import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const TRIP_TYPES = ["One-way", "Round-trip", "Multi-city"];

export default function Home() {
  const router = useRouter();
  const [checkedSession, setCheckedSession] = useState(false);
  const [tripType, setTripType] = useState("One-way");
  const [origin, setOrigin] = useState("DEA");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
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

  const searchFlights = async () => {
    setError("");
    if (!destination || !departureDate) {
      setError("To aur Departure Date bharna zaroori hai");
      return;
    }
    setLoading(true);
    setOffers(null);
    try {
      const res = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin,
          destination,
          departureDate,
          returnDate: tripType === "Round-trip" ? returnDate : undefined,
          passengers,
          cabinClass,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kuch masla ho gaya");
      } else {
        setOffers(data.offers);
      }
    } catch (e) {
      setError("Server tak nahi pohanch saka");
    } finally {
      setLoading(false);
    }
  };

  if (!checkedSession) return null;

  return (
    <div className="min-h-screen bg-bg text-white pb-16">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-5">
        <button onClick={() => router.push("/login")} className="text-2xl leading-none">
          ←
        </button>
        <h1 className="text-xl font-bold">Flights Search</h1>
      </div>

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
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-bg border border-cardline rounded-full w-11 h-11 flex items-center justify-center"
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
          {loading ? "Search ho raha hai..." : "Search Flights"}
        </button>
      </div>

      {error && <p className="text-red-400 text-center mt-4 px-4">{error}</p>}

      {/* Results */}
      {offers && (
        <div className="px-4 mt-6 space-y-3">
          {offers.length === 0 && (
            <p className="text-muted text-center">Is route par flights nahi milin.</p>
          )}
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-card border border-cardline rounded-xl2 px-4 py-4 flex items-center justify-between"
            >
              <div>
                <p className="font-bold">{offer.airline}</p>
                <p className="text-muted text-sm">
                  {offer.originAirport} → {offer.destinationAirport} ·{" "}
                  {offer.stops === 0 ? "Direct" : `${offer.stops} stop(s)`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-brand font-bold text-lg">
                  {offer.currency} {offer.finalPrice}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
