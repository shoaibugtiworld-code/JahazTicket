import { useState, useEffect, useRef } from "react";

export default function AirportAutocomplete({
  value,
  onChange,
  placeholder = "City or airport",
  compact = false,
}) {
  const [inputValue, setInputValue] = useState(value?.label || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setInputValue(value?.label || "");
  }, [value]);

  const fetchAirports = (query) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        // This matches the actual backend route — pages/api/places/suggestions.js —
        // which proxies Duffel's Places API and returns { places: [...] }.
        const res = await fetch(`/api/places/suggestions?query=${encodeURIComponent(query)}`);
        const data = await res.json();
        const places = (data.places || []).map((p) => ({
          iataCode: p.iataCode,
          label: p.isAllAirports ? `${p.name} — All airports` : `${p.cityName || p.name} (${p.iataCode})`,
          name: p.name,
          city: p.cityName,
          country: p.countryName,
          isAllAirports: p.isAllAirports,
        }));
        setSuggestions(places);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (val.length >= 2) {
      fetchAirports(val);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    if (!val) onChange(null);
  };

  const handleSelect = (airport) => {
    setInputValue(airport.label);
    setShowSuggestions(false);
    onChange(airport);
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => inputValue.length >= 2 && setShowSuggestions(true)}
        placeholder={placeholder}
        className={`w-full border border-jtBorder rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-jtCyan/50 focus:border-jtCyan bg-white text-jtText ${
          compact ? "text-sm" : ""
        }`}
      />
      {showSuggestions && (suggestions.length > 0 || loading) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-jtBorder rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-2 text-jtMuted text-sm">Searching...</div>
          ) : (
            suggestions.map((airport) => (
              <button
                key={airport.iataCode + (airport.isAllAirports ? "-city" : "-airport") + airport.name}
                type="button"
                onClick={() => handleSelect(airport)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-b border-jtBorder last:border-0"
              >
                <div className="font-medium text-jtText flex items-center gap-1.5">
                  {airport.city || airport.name} <span className="text-jtCyan">({airport.iataCode})</span>
                  {airport.isAllAirports && (
                    <span className="text-[10px] bg-jtCyan/10 text-jtCyan px-1.5 py-0.5 rounded">
                      All airports
                    </span>
                  )}
                </div>
                <div className="text-xs text-jtMuted">
                  {airport.isAllAirports ? "Searches every airport in this city" : airport.name}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
