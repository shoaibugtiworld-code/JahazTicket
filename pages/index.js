import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import AirportAutocomplete from "../components/AirportAutocomplete";

const TRIP_TYPES = ["One-way", "Round-trip", "Multi-city"];

function emptySegment() {
  return { origin: null, destination: null, date: "" };
}

export default function Home() {
  const router = useRouter();
  const [checkedSession, setCheckedSession] = useState(false);
  const [tripType, setTripType] = useState("One-way");

  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  const [segments, setSegments] = useState([emptySegment(), emptySegment()]);

  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);
  const [cabinClass, setCabinClass] = useState("economy");
  const [showPaxModal, setShowPaxModal] = useState(false);

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
      return [{ origin: origin?.iataCode, destination: destination?.iataCode, date: departureDate }];
    }
    if (tripType === "Round-trip") {
      return [
        { origin: origin?.iataCode, destination: destination?.iataCode, date: departureDate },
        { origin: destination?.iataCode, destination: origin?.iataCode, date: returnDate },
      ];
    }
    return segments.map((s) => ({
      origin: s.origin?.iataCode,
      destination: s.destination?.iataCode,
      date: s.date,
    }));
  };

  const buildPassengers = () => {
    const list = [];
    for (let i = 0; i < adultCount; i++) list.push({ type: "adult" });
    for (let i = 0; i < childCount; i++) list.push({ age: 8 });
    for (let i = 0; i < infantCount; i++) list.push({ age: 1 });
    return list;
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
    if (adultCount < 1) return "At least 1 adult passenger is required";
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
          passengers: buildPassengers(),
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
    <div className="min-h-screen bg-jtWhite text-jtText pb-16">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-jtBorder">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size={40} withText={true} textClass="text-lg" />
          <button
            onClick={() => router.push("/login")}
            className="text-jtMuted text-sm hover:text-jtNavy transition-colors font-medium"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-jtNavy via-[#0d2e52] to-jtNavyDark py-12 md:py-20 overflow-hidden">
        {/* Decorative flight path lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
            <path d="M0,300 Q300,100 600,300 T1200,300" fill="none" stroke="#00A8E8" strokeWidth="2" />
            <path d="M0,350 Q400,150 800,350 T1200,350" fill="none" stroke="#00A8E8" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
            Find & Book <span className="text-jtCyan">Cheap Flights</span>
          </h1>
          <p className="text-blue-100/80 text-lg mb-8">
            Compare prices, book instantly, and fly with confidence.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
        {/* Trip type tabs */}
        <div className="flex gap-2 mb-4">
          {TRIP_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setTripType(type)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                tripType === type
                  ? "border-jtCyan bg-jtCyan/10 text-jtCyan"
                  : "border-jtBorder bg-white text-jtMuted hover:text-jtText"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Search card */}
        <div className="bg-white border border-jtBorder rounded-2xl overflow-hidden shadow-xl relative">
          {tripType !== "Multi-city" ? (
            <>
              <div className="flex items-center gap-4 px-4 py-4 border-b border-jtBorder">
                <span className="text-2xl">🛫</span>
                <div className="flex-1">
                  <AirportAutocomplete
                    label="From"
                    value={origin}
                    onChange={setOrigin}
                    placeholder="City or airport"
                    compact
                  />
                </div>
              </div>

              <button
                onClick={swap}
                className="absolute right-4 top-[52px] -translate-y-1/2 bg-jtWhite border border-jtBorder rounded-full w-11 h-11 flex items-center justify-center shadow-sm hover:bg-jtCyan/10 transition-colors z-10 text-jtNavy"
              >
                ⇅
              </button>

              <div className="flex items-center gap-4 px-4 py-4 border-b border-jtBorder">
                <span className="text-2xl">🛬</span>
                <div className="flex-1">
                  <AirportAutocomplete
                    label="To"
                    value={destination}
                    onChange={setDestination}
                    placeholder="City or airport"
                    compact
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 px-4 py-4 border-b border-jtBorder">
                <span className="text-2xl">📅</span>
                <div className="flex-1">
                  <p className="text-jtMuted text-xs">Departure Date</p>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="bg-transparent font-bold text-lg outline-none w-full text-jtText"
                  />
                </div>
              </div>

              {tripType === "Round-trip" && (
                <div className="flex items-center gap-4 px-4 py-4 border-b border-jtBorder">
                  <span className="text-2xl">📅</span>
                  <div className="flex-1">
                    <p className="text-jtMuted text-xs">Return Date</p>
                    <input
                      type="date"
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="bg-transparent font-bold text-lg outline-none w-full text-jtText"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="divide-y divide-jtBorder">
              {segments.map((seg, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  {segments.length > 2 && (
                    <button
                      onClick={() => removeSegment(i)}
                      className="w-6 h-6 rounded-full border border-jtBorder flex items-center justify-center text-xs shrink-0 text-jtMuted hover:text-red-500 hover:border-red-300"
                    >
                      ✕
                    </button>
                  )}
                  <div className="flex-1">
                    <AirportAutocomplete
                      label="From"
                      value={seg.origin}
                      onChange={(place) => updateSegment(i, "origin", place)}
                      placeholder="..."
                      compact
                    />
                  </div>
                  <div className="flex-1 border-l border-jtBorder pl-3">
                    <AirportAutocomplete
                      label="To"
                      value={seg.destination}
                      onChange={(place) => updateSegment(i, "destination", place)}
                      placeholder="..."
                      compact
                    />
                  </div>
                  <div className="flex-1 border-l border-jtBorder pl-3">
                    <p className="text-jtMuted text-xs">Date</p>
                    <input
                      type="date"
                      value={seg.date}
                      onChange={(e) => updateSegment(i, "date", e.target.value)}
                      className="bg-transparent font-bold outline-none w-full text-jtText"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={addSegment}
                className="w-full flex items-center gap-2 px-4 py-3 text-jtCyan font-semibold hover:bg-jtCyan/5"
              >
                <span className="w-6 h-6 rounded-full bg-jtCyan text-white flex items-center justify-center text-sm">
                  +
                </span>
                Add one more flight
              </button>
            </div>
          )}

          <div
            onClick={() => setShowPaxModal(true)}
            className="flex items-center gap-4 px-4 py-4 border-b border-jtBorder cursor-pointer hover:bg-jtWhite/50 transition-colors"
          >
            <span className="text-2xl">👨‍👩‍👧</span>
            <div className="flex-1">
              <p className="text-jtMuted text-xs">Passengers &amp; Cabin Class</p>
              <p className="font-bold text-lg mt-1 text-jtText">
                {adultCount + childCount + infantCount} {adultCount + childCount + infantCount === 1 ? "Passenger" : "Passengers"} · {" "}
                {cabinClass.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-4 py-4">
            <span className="text-2xl">💳</span>
            <div>
              <p className="text-jtMuted text-xs mb-1">Payment Types</p>
              <p className="text-sm text-jtText">Mastercard · Visa · EasyPaisa · JazzCash</p>
            </div>
          </div>
        </div>

        {/* Search button */}
        <div className="mt-6">
          <button
            onClick={searchFlights}
            disabled={loading}
            className="w-full bg-jtOrange hover:bg-jtOrangeDark transition-colors rounded-full py-4 font-bold text-lg text-white shadow-lg shadow-jtOrange/30 disabled:opacity-60 active:scale-[0.98]"
          >
            {loading ? "Searching..." : "Search Flights"}
          </button>
        </div>

        {error && <p className="text-red-500 text-center mt-4 px-4 font-medium">{error}</p>}

        {/* Results */}
        {offers && (
          <div className="mt-8 space-y-4">
            {offers.length === 0 && (
              <p className="text-jtMuted text-center py-8">No flights found on this route.</p>
            )}
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white border border-jtBorder rounded-2xl px-5 py-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-jtNavy">{offer.airline}</p>
                  {offer.legs[0]?.flightNumbers?.[0] && (
                    <p className="text-jtMuted text-xs">
                      {offer.legs[0].flightNumbers.join(", ")}
                      {offer.legs[0].fareBrand ? ` (${offer.legs[0].fareBrand})` : ""}
                    </p>
                  )}
                </div>
                <div className="space-y-3 mb-4">
                  {offer.legs.map((leg, i) => {
                    const depTime = leg.departureDate
                      ? new Date(leg.departureDate).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                      : "-";
                    const arrTime = leg.arrivalDate
                      ? new Date(leg.arrivalDate).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                      : "-";
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between text-sm font-semibold text-jtText">
                          <span>{depTime}</span>
                          <span className="text-jtMuted text-xs">{leg.duration || ""}</span>
                          <span>{arrTime}</span>
                        </div>
                        <div className="flex items-center justify-between text-jtMuted text-xs mt-1">
                          <span>{leg.originCity || leg.originAirport} ({leg.originAirport})</span>
                          <span>{leg.stops === 0 ? "Nonstop" : `${leg.stops} stop(s)`}</span>
                          <span>{leg.destinationCity || leg.destinationAirport} ({leg.destinationAirport})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-jtBorder">
                  <div>
                    <p className="text-jtOrange font-bold text-xl">
                      {offer.currency} {offer.finalPrice}
                    </p>
                    <p className="text-jtMuted text-xs">All-inclusive · no hidden charges later</p>
                  </div>
                  <button
                    onClick={() => {
                      sessionStorage.setItem("jt_selected_offer", JSON.stringify(offer));
                      router.push("/booking");
                    }}
                    className="bg-jtOrange hover:bg-jtOrangeDark transition-colors rounded-full px-6 py-2 text-sm font-semibold text-white shadow-md"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Passengers & Cabin Class modal */}
      {showPaxModal && (
        <div className="fixed inset-0 bg-jtNavy/60 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white border-t sm:border border-jtBorder rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-jtBorder">
              <button onClick={() => setShowPaxModal(false)} className="text-jtMuted text-xl hover:text-jtText">✕</button>
              <p className="font-bold text-jtNavy">Passengers &amp; Cabin Class</p>
              <button onClick={() => setShowPaxModal(false)} className="text-jtCyan text-xl font-bold">✓</button>
            </div>

            <div className="px-4 py-4">
              <p className="text-jtMuted text-xs uppercase tracking-wide mb-3 font-semibold">Passengers</p>

              {[
                { label: "Adult", hint: "(>12 years)", value: adultCount, setValue: setAdultCount, min: 1 },
                { label: "Child", hint: "(2–12 years)", value: childCount, setValue: setChildCount, min: 0 },
                { label: "Infant", hint: "(<2 years)", value: infantCount, setValue: setInfantCount, min: 0 },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-3 border-b border-jtBorder last:border-0">
                  <div>
                    <p className="font-semibold text-jtText">{row.label}</p>
                    <p className="text-jtMuted text-xs">{row.hint}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => row.setValue(Math.max(row.min, row.value - 1))}
                      className="w-9 h-9 rounded-full border border-jtBorder flex items-center justify-center text-jtText hover:bg-jtWhite"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-bold text-jtText">{row.value}</span>
                    <button
                      onClick={() => row.setValue(row.value + 1)}
                      className="w-9 h-9 rounded-full border border-jtBorder flex items-center justify-center text-jtText hover:bg-jtWhite"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <p className="text-jtMuted text-xs uppercase tracking-wide mt-6 mb-3 font-semibold">Cabin Class</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "economy", label: "Economy" },
                  { id: "premium_economy", label: "Premium Economy" },
                  { id: "business", label: "Business" },
                  { id: "first", label: "First Class" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCabinClass(c.id)}
                    className={`py-3 rounded-xl border text-sm font-semibold ${
                      cabinClass === c.id
                        ? "border-jtCyan bg-jtCyan/10 text-jtCyan"
                        : "border-jtBorder text-jtText hover:border-jtCyan/50"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
