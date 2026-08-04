import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Logo from "../components/Logo";
import StepIndicator from "../components/StepIndicator";
import CountdownTimer from "../components/CountdownTimer";

const METHODS = [
  { id: "card", label: "Debit / Credit Card", sub: "Visa · Mastercard · all Pakistani & international cards" },
  { id: "bank", label: "Bank Transfer", sub: "Pay directly from your bank account" },
  { id: "easypaisa", label: "EasyPaisa", sub: "Active EasyPaisa account needed" },
  { id: "jazzcash", label: "JazzCash", sub: "Pay using your JazzCash wallet" },
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
    <div className="min-h-screen bg-bg text-white pb-28">
      <div className="flex items-center justify-between px-4 py-5">
        <button onClick={() => router.push("/addons")} className="text-xl">←</button>
        <p className="font-bold">Payment</p>
        <Logo />
      </div>

      <div className="flex items-center justify-between">
        <StepIndicator current="Payment" />
        <div className="pr-4">
          <CountdownTimer expiresAt={offer.expiresAt} />
        </div>
      </div>

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
      </div>

      <p className="px-4 text-muted text-sm mb-2">Select a payment method</p>

      <div className="mx-4 bg-card border border-cardline rounded-xl2 divide-y divide-cardline overflow-hidden mb-6">
        {METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className="w-full flex items-center gap-4 px-4 py-4 text-left"
          >
            <span
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                method === m.id ? "border-brand" : "border-cardline"
              }`}
            >
              {method === m.id && <span className="w-2.5 h-2.5 rounded-full bg-brand" />}
            </span>
            <span>
              <span className="block font-semibold">{m.label}</span>
              <span className="block text-muted text-xs mt-0.5">{m.sub}</span>
            </span>
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-center px-4 mb-4">{error}</p>}

      {status === "pending_integration" && (
        <div className="mx-4 bg-card border border-cardline rounded-xl2 px-4 py-4 text-center mb-6">
          <p className="font-semibold mb-1">Payment coming soon</p>
          <p className="text-muted text-sm">
            Your payment aggregator isn't connected yet. Once it's live, this button will complete
            the booking instantly.
          </p>
        </div>
      )}

      {/* Sticky bottom price + pay bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-cardline px-4 py-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-muted text-sm">Total price</span>
          <span className="font-bold text-lg">
            {offer.currency} {offer.finalPrice}
          </span>
        </div>
        <p className="text-muted text-[11px] mb-3">
          No extra charges — this is exactly what you'll pay.
        </p>
        <button
          onClick={pay}
          disabled={status === "processing"}
          className="w-full bg-brand hover:bg-brandDark transition-colors rounded-full py-4 font-bold text-lg disabled:opacity-60"
        >
          {status === "processing" ? "Processing..." : "Pay Now"}
        </button>
      </div>
    </div>
  );
}
