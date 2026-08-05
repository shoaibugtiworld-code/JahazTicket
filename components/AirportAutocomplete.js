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

  // Outside click handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync with external value
  useEffect(() => {
    if (value?.label) {
      setInputValue(value.label);
    } else {
      setInputValue("");
    }
  }, [value]);

  // Fetch airports (your original endpoint)
  const fetchAirports = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      // ✅ IMPORTANT: Use YOUR actual API endpoint
      // This is the original one you had before:
      const res = await fetch(`/api/airports?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSuggestions(data);
    } catch (e) {
      console.error("Airport fetch error:", e);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
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
    // Clear selection if input is empty
    if (!val) onChange(null);
  };

  const handleSelect = (airport) => {
    setInputValue(airport.label);
    setShowSuggestions(false);
    onChange(airport); // this sets origin/destination in Home
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
                key={airport.iataCode}
                onClick={() => handleSelect(airport)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-b border-jtBorder last:border-0"
              >
                <div className="font-medium text-jtText">{airport.label}</div>
                <div className="text-xs text-jtMuted">
                  {airport.iataCode} · {airport.city}, {airport.country}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
