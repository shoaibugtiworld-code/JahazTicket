import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Logo from "../components/Logo";
import StepIndicator from "../components/StepIndicator";
import CountdownTimer from "../components/CountdownTimer";

export default function Addons() {
  const router = useRouter();
  const [offer, setOffer] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const o = sessionStorage.getItem("jt_selected_offer");
    const p = sessionStorage.getItem("jt_passenger");
    if (!o || !p) {
      router.replace("/");
      return;
    }
    setOffer(JSON.parse(o));
    setChecked(true);
  }, [router]);

  if (!checked || !offer) return null;

  return (
    <div className="min-h-screen bg-bg text-white pb-28">
      <div className="flex items-center justify-between px-4 py-5">
        <button onClick={() => router.push("/booking")} className="text-xl">←</button>
        <Logo />
        <span className="w-6" />
      </div>

      <div className="flex items-center justify-between">
        <StepIndicator current="Add-ons" />
        <div className="pr-4">
          <CountdownTimer expiresAt={offer.expiresAt} />
        </div>
      </div>

      <div className="mx-4 mt-4 bg-card border border-cardline rounded-xl2 px-4 py-6 text-center">
        <p className="font-semibold mb-1">Extra baggage, seats and meals — coming soon</p>
        <p className="text-muted text-sm">
          We're connecting real airline pricing for these add-ons. For now you can continue straight
          to payment with your selected fare.
        </p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-cardline px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-muted text-sm">Total price</span>
          <span className="font-bold text-lg">
            {offer.currency} {offer.finalPrice}
          </span>
        </div>
        <button
          onClick={() => router.push("/payment")}
          className="w-full bg-brand hover:bg-brandDark transition-colors rounded-full py-4 font-bold text-lg"
        >
          Continue without add-ons
        </button>
      </div>
    </div>
  );
}
