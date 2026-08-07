import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Logo from "../components/Logo";
import Footer from "../components/Footer";
import AirportAutocomplete from "../components/AirportAutocomplete";
import { supabase } from "../lib/supabaseClient";

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
    if (session) {
      setCheckedSession(true);
      return;
    }
    // Google OAuth redirects straight back to "/" — check for a real
    // Supabase session before deciding to bounce to /login.
    if (!supabase) {
      router.replace("/login");
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        localStorage.setItem(
          "jt_session",
          JSON.stringify({ type: "supabase", userId: data.session.user.id, email: data.session.user.email })
        );
        setCheckedSession(true);
      } else {
        router.replace("/login");
      }
    });
  }, [router]);

  // Pre-fill and auto-search when arriving from a Footer route/airline shortcut
  useEffect(() => {
    if (!router.isReady || !checkedSession) return;
    const { fromCode, fromLabel, toCode, toLabel, date, auto } = router.query;
    if (fromCode && toCode) {
      setTripType("One-way");
      setOrigin({ iataCode: fromCode, label: fromLabel || fromCode });
      setDestination({ iataCode: toCode, label: toLabel || toCode });
      if (date) setDepartureDate(date);
      if (auto === "1") {
        setTimeout(() => searchFlightsWith({ iataCode: fromCode }, { iataCode: toCode }, date), 200);
      }
      router.replace("/", undefined, { shallow: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, checkedSession]);

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

  const runSearch = async (slices, passengers) => {
    setError("");
    setLoading(true);
    setOffers(null);
    try {
      const res = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slices, passengers, cabinClass }),
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

  // Used by Footer route/airline shortcuts — searches immediately with explicit
  // values instead of relying on state that may not have re-rendered yet.
  const searchFlightsWith = (originObj, destinationObj, dateStr) => {
    const date = dateStr || new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
    runSearch([{ origin: originObj.iataCode, destination: destinationObj.iataCode, date }], [{ type: "adult" }]);
  };

  const searchFlights = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    runSearch(buildSlices(), buildPassengers());
  };

  const handleSignOut = () => {
    localStorage.removeItem("jt_session");
    if (supabase) supabase.auth.signOut();
    router.push("/login");
  };

  if (!checkedSession) return null;

  return (
    <div className="min-h-screen bg-jtWhite text-jtText">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-jtBorder">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size={36} withText={true} textClass="text-lg" />
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-jtText">
            <a href="#" className="hover:text-jtCyan transition-colors">Flights</a>
            <a href="#" className="hover:text-jtCyan transition-colors">My Bookings</a>
            <a href="#" className="hover:text-jtCyan transition-colors">Support</a>
          </nav>
          <button onClick={handleSignOut} className="btn-secondary text-sm py-2 px-4">
            Sign out
          </button>
        </div>
      </header>

      {/* Hero / Search Section */}
      <section className="relative bg-gradient-to-br from-jtNavy via-[#0d2e52] to-jtNavyDark py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
            <path d="M0,300 Q300,100 600,300 T1200,300" fill="none" stroke="#00A8E8" strokeWidth="2" />
            <path d="M0,350 Q400,150 800,350 T1200,350" fill="none" stroke="#00A8E8" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white mb-4">
            Find &amp; Book <span className="text-jtCyan">Cheap Flights</span>
          </h1>
          <p className="text-blue-100/80 text-lg mb-8">
            Compare prices, book instantly, and fly with confidence.
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-2xl p-4 md:p-6 shadow-2xl text-left">
            <div className="flex flex-wrap gap-2 mb-4">
              {TRIP_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setTripType(type)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    tripType === type
                      ? "bg-jtCyan text-white"
                      : "bg-jtWhite text-jtText border border-jtBorder hover:bg-gray-50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {tripType !== "Multi-city" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative">
                  <div>
                    <label className="block text-xs font-medium text-jtMuted mb-1">From</label>
                    <AirportAutocomplete value={origin} onChange={setOrigin} placeholder="City or airport" compact />
                  </div>
                  <div className="relative">
                    <label className="block text-xs font-medium text-jtMuted mb-1">To</label>
                    <AirportAutocomplete
                      value={destination}
                      onChange={setDestination}
                      placeholder="City or airport"
                      compact
                    />
                    <button
                      onClick={swap}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white border border-jtBorder rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-gray-50 transition-colors"
                    >
                      ↕
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-jtMuted mb-1">Departure Date</label>
                    <input
                      type="date"
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="w-full border border-jtBorder rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-jtCyan/50 focus:border-jtCyan bg-white text-jtText"
                    />
                  </div>
                  {tripType === "Round-trip" && (
                    <div>
                      <label className="block text-xs font-medium text-jtMuted mb-1">Return Date</label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className="w-full border border-jtBorder rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-jtCyan/50 focus:border-jtCyan bg-white text-jtText"
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {segments.map((seg, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-xs font-medium text-jtMuted mb-1">From</label>
                      <AirportAutocomplete
                        value={seg.origin}
                        onChange={(place) => updateSegment(i, "origin", place)}
                        placeholder="..."
                        compact
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-jtMuted mb-1">To</label>
                      <AirportAutocomplete
                        value={seg.destination}
                        onChange={(place) => updateSegment(i, "destination", place)}
                        placeholder="..."
                        compact
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-jtMuted mb-1">Date</label>
                        <input
                          type="date"
                          value={seg.date}
                          onChange={(e) => updateSegment(i, "date", e.target.value)}
                          className="w-full border border-jtBorder rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-jtCyan/50 focus:border-jtCyan bg-white text-jtText"
                        />
                      </div>
                      {segments.length > 2 && (
                        <button
                          onClick={() => removeSegment(i)}
                          className="mt-6 w-8 h-8 rounded-full border border-jtBorder flex items-center justify-center text-xs hover:bg-gray-50 transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={addSegment}
                  className="text-jtCyan font-semibold text-sm hover:underline flex items-center gap-1"
                >
                  <span className="w-5 h-5 rounded-full bg-jtCyan text-white flex items-center justify-center text-xs">+</span>
                  Add one more flight
                </button>
              </div>
            )}

            {/* Passengers & Cabin Class */}
            <div
              onClick={() => setShowPaxModal(true)}
              className="mt-4 flex items-center gap-3 p-3 border border-jtBorder rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <span className="text-xl">👪</span>
              <div className="flex-1">
                <p className="text-xs text-jtMuted">Passengers &amp; Cabin Class</p>
                <p className="font-semibold text-sm text-jtText">
                  {adultCount + childCount + infantCount}{" "}
                  {adultCount + childCount + infantCount === 1 ? "Passenger" : "Passengers"} ·{" "}
                  {cabinClass.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </p>
              </div>
              <span className="text-jtMuted text-sm">▼</span>
            </div>

            <div className="mt-4 flex items-center gap-3 text-sm text-jtMuted border-t border-jtBorder pt-3">
              <span className="text-xl">💳</span>
              <span>Visa · Mastercard · Google Pay · International Cards</span>
            </div>

            <button
              onClick={searchFlights}
              disabled={loading}
              className="mt-4 w-full btn-primary flex items-center justify-center gap-2 text-base py-3.5"
            >
              {loading ? (
                "Searching..."
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Flights
                </>
              )}
            </button>

            {error && <p className="mt-3 text-red-500 text-sm text-center">{error}</p>}
          </div>
        </div>
      </section>

      {/* Results Section */}
      {offers && (
        <section className="max-w-4xl mx-auto px-4 py-8">
          <h2 className="font-display text-2xl font-bold text-jtText mb-4">Available Flights</h2>
          <div className="space-y-4">
            {offers.length === 0 && <p className="text-jtMuted text-center">No flights found on this route.</p>}
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white border border-jtBorder rounded-2xl p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-jtWhite flex items-center justify-center border border-jtBorder">
                      <span className="text-jtNavy font-bold text-xs">{offer.airline?.substring(0, 2) || "FL"}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-jtText">{offer.airline || "Airline"}</p>
                      {offer.legs[0]?.flightNumbers?.[0] && (
                        <p className="text-xs text-jtMuted">
                          {offer.legs[0].flightNumbers.join(", ")}
                          {offer.legs[0].fareBrand ? ` (${offer.legs[0].fareBrand})` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-jtNavy">
                      {offer.currency} {offer.finalPrice}
                    </p>
                    <p className="text-xs text-jtMuted">All-inclusive</p>
                    <button
                      onClick={() => {
                        sessionStorage.setItem("jt_selected_offer", JSON.stringify(offer));
                        router.push("/booking");
                      }}
                      className="mt-2 btn-primary text-sm py-2 px-5"
                    >
                      Book Now
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-jtBorder">
                  {offer.legs.map((leg, i) => {
                    const depDate = leg.departureDate
                      ? new Date(leg.departureDate).toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })
                      : "-";
                    const depTime = leg.departureDate
                      ? new Date(leg.departureDate).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                      : "-";
                    const arrTime = leg.arrivalDate
                      ? new Date(leg.arrivalDate).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
                      : "-";
                    return (
                      <div key={i} className="py-1.5 border-b border-jtBorder/60 last:border-0">
                        <p className="text-jtCyan text-xs font-semibold mb-0.5">{depDate}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-jtText">{depTime}</span>
                          <span className="text-jtMuted text-xs">{leg.duration || ""}</span>
                          <span className="font-medium text-jtText">{arrTime}</span>
                          <span className="text-xs text-jtMuted">
                            {leg.originCity || leg.originAirport} ({leg.originAirport}) →{" "}
                            {leg.destinationCity || leg.destinationAirport} ({leg.destinationAirport})
                          </span>
                          <span className="text-xs text-jtMuted">
                            {leg.stops === 0 ? "Nonstop" : `${leg.stops} stop(s)`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Passenger & Cabin Class Modal */}
      {showPaxModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white border-t sm:border border-jtBorder rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-jtBorder">
              <button onClick={() => setShowPaxModal(false)} className="text-2xl text-jtMuted hover:text-jtText">
                ✕
              </button>
              <p className="font-bold text-jtText">Passengers &amp; Cabin Class</p>
              <button onClick={() => setShowPaxModal(false)} className="text-jtCyan text-2xl">
                ✓
              </button>
            </div>

            <div className="px-4 py-4">
              <p className="text-xs font-medium text-jtMuted uppercase tracking-wider mb-3">Passengers</p>

              {[
                { label: "Adult", hint: "(>12 years)", value: adultCount, setValue: setAdultCount, min: 1 },
                { label: "Child", hint: "(2–12 years)", value: childCount, setValue: setChildCount, min: 0 },
                { label: "Infant", hint: "(<2 years)", value: infantCount, setValue: setInfantCount, min: 0 },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-3 border-b border-jtBorder last:border-0">
                  <div>
                    <p className="font-semibold text-jtText">{row.label}</p>
                    <p className="text-xs text-jtMuted">{row.hint}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => row.setValue(Math.max(row.min, row.value - 1))}
                      className="w-9 h-9 rounded-full border border-jtBorder flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-bold text-jtText">{row.value}</span>
                    <button
                      onClick={() => row.setValue(row.value + 1)}
                      className="w-9 h-9 rounded-full border border-jtBorder flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <p className="text-xs font-medium text-jtMuted uppercase tracking-wider mt-6 mb-3">Cabin Class</p>
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
                    className={`py-3 rounded-xl border text-sm font-semibold transition-colors ${
                      cabinClass === c.id
                        ? "border-jtCyan bg-jtCyan/10 text-jtCyan"
                        : "border-jtBorder text-jtText hover:bg-gray-50"
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
