import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Logo from "../components/Logo";

const METHODS = [
  { id: "jazzcash", label: "JazzCash" },
  { id: "easypaisa", label: "EasyPaisa" },
  { id: "card", label: "Visa / Mastercard" },
  { id: "bank", label: "Bank Transfer" },
];

export default function Payment() {
  const router = useRouter();
  const [offer, setOffer] = useState(null);
  const [passenger, setPassenger] = useState(null);
  const [checked, setChecked] = useState(false);
  const [method, setMethod] = useState(null);
  const [status, setStatus] = useState(null); // null | "processing" | "pending_integration"
  const [error, setError] = useState("");

  useEffect(() => {
    const o = sessionStorage.getItem("jt_selected_offer");
    const p = sessionStorage.getItem("jt_passenger");
    if (!o || !p) {
      router.replace("/");
      return;
    }
    setOffer(JSON.parse(o));
    setPassenger(JSON.parse(p));
    setChecked(true);
  }, [router]);

  const pay = async () => {
    if (!method) {
      setError("Please select a payment method");
      return;
    }
    setError("");
    setStatus("processing");
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, offer, passenger }),
      });
      const data = await res.json();
      setStatus(data.status);
      if (data.message) setError(data.message);
    } catch (e) {
      setStatus(null);
      setError("Couldn't reach the server");
    }
  };

  if (!checked || !offer || !passenger) return null;

  return (
    <div className="min-h-screen bg-bg text-white pb-16">
      <div className="flex items-center justify-between px-4 py-5">
        <Logo />
        <button onClick={() => router.push("/booking")} className="text-muted text-sm">
          Back
        </button>
      </div>

      <h1 className="px-4 text-xl font-bold mb-4">Payment</h1>

      {/* Review summary */}
      <div className="mx-4 bg-card border border-cardline rounded-xl2 px-4 py-4 mb-6 space-y-1">
        <p className="font-bold">{offer.airline}</p>
        {offer.legs.map((leg, i) => (
          <p key={i} className="text-muted text-sm">
            {leg.originAirport} → {leg.destinationAirport} ·{" "}
            {leg.stops === 0 ? "Direct" : `${leg.stops} stop(s)`}
          </p>
        ))}
        <p className="text-muted text-sm">Passenger: {passenger.fullName}</p>
        <p className="text-brand font-bold text-lg mt-2">
          {offer.currency} {offer.finalPrice}
        </p>
      </div>

      <div className="px-4 space-y-2 mb-6">
        <p className="text-muted text-xs mb-2">Select Payment Method</p>
        {METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={`w-full text-left px-4 py-3 rounded-xl border ${
              method === m.id ? "border-brand text-brand" : "border-cardline bg-card"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-center px-4 mb-4">{error}</p>}

      {status === "pending_integration" ? (
        <div className="mx-4 bg-card border border-cardline rounded-xl2 px-4 py-4 text-center">
          <p className="font-semibold mb-1">Payment coming soon</p>
          <p className="text-muted text-sm">
            Your payment aggregator isn't connected yet. Once it's live, this button will complete
            the booking instantly.
          </p>
        </div>
      ) : (
        <div className="px-4">
          <button
            onClick={pay}
            disabled={status === "processing"}
            className="w-full bg-brand hover:bg-brandDark transition-colors rounded-full py-4 font-bold text-lg disabled:opacity-60"
          >
            {status === "processing" ? "Processing..." : `Pay ${offer.currency} ${offer.finalPrice}`}
          </button>
        </div>
      )}
    </div>
  );
}
