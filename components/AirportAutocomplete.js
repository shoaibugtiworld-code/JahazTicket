import { useEffect, useRef, useState } from "react";

export default function AirportAutocomplete({ label, value, onChange, placeholder, compact }) {
  const [query, setQuery] = useState(value?.label || "");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setQuery(value?.label || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInput = (text) => {
    setQuery(text);
    setOpen(true);
    clearTimeout(debounceRef.current);

    if (text.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places/suggestions?query=${encodeURIComponent(text)}`);
        const data = await res.json();
        setResults(data.places || []);
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);
  };

  const select = (place) => {
    const label = place.isAllAirports
      ? `${place.name} — All airports`
      : `${place.cityName || place.name} (${place.iataCode})`;
    onChange({ iataCode: place.iataCode, label });
    setQuery(label);
    setOpen(false);
  };

  return (
    <div className="relative" ref={boxRef}>
      {!compact && <label className="text-muted text-xs">{label}</label>}
      {compact && <p className="text-muted text-xs">{label}</p>}
      <input
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => query.length >= 2 && setOpen(true)}
        placeholder={placeholder || "City or airport name"}
        className={
          compact
            ? "bg-transparent font-bold text-lg outline-none w-full placeholder-muted"
            : "w-full bg-card border border-cardline rounded-xl px-4 py-3 mt-1 outline-none focus:border-brand"
        }
      />
      {open && (loading || results.length > 0) && (
        <div className="absolute z-20 left-0 right-0 mt-1 bg-card border border-cardline rounded-xl max-h-64 overflow-y-auto shadow-lg">
          {loading && <p className="text-muted text-xs px-4 py-3">Searching...</p>}
          {!loading &&
            results.map((place) => (
              <button
                type="button"
                key={place.iataCode + place.type + place.name}
                onClick={() => select(place)}
                className="w-full text-left px-4 py-2.5 hover:bg-cardline transition-colors border-b border-cardline last:border-0"
              >
                <p className="text-sm font-semibold">
                  {place.isAllAirports ? place.name : place.cityName || place.name}{" "}
                  <span className="text-brand">({place.iataCode})</span>
                  {place.isAllAirports && (
                    <span className="ml-1 text-[10px] bg-brand/20 text-brand px-1.5 py-0.5 rounded">
                      All airports
                    </span>
                  )}
                </p>
                <p className="text-muted text-xs">
                  {place.isAllAirports ? "Searches every airport in this city" : place.name}
                </p>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
