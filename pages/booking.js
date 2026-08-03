import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Logo from "../components/Logo";

export default function Booking() {
  const router = useRouter();
  const [offer, setOffer] = useState(null);
  const [checked, setChecked] = useState(false);

  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("male");
  const [dob, setDob] = useState("");
  const [idNumber, setIdNumber] = useState(""); // CNIC or Passport
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const session = localStorage.getItem("jt_session");
    if (!session) {
      router.replace("/login");
      return;
    }
    const stored = sessionStorage.getItem("jt_selected_offer");
    if (!stored) {
      router.replace("/");
      return;
    }
    setOffer(JSON.parse(stored));
    setChecked(true);
  }, [router]);

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (!fullName || !dob || !idNumber || !email || !phone) {
      setError("Please fill in all passenger details");
      return;
    }
    const passenger = { fullName, gender, dob, idNumber, email, phone };
    sessionStorage.setItem("jt_passenger", JSON.stringify(passenger));
    router.push("/payment");
  };

  if (!checked || !offer) return null;

  return (
    <div className="min-h-screen bg-bg text-white pb-16">
      <div className="flex items-center justify-between px-4 py-5">
        <Logo />
        <button onClick={() => router.push("/")} className="text-muted text-sm">
          Cancel
        </button>
      </div>

      <h1 className="px-4 text-xl font-bold mb-4">Passenger Details</h1>

      {/* Selected flight summary */}
      <div className="mx-4 bg-card border border-cardline rounded-xl2 px-4 py-4 mb-6">
        <p className="font-bold">{offer.airline}</p>
        <p className="text-muted text-sm">
          {offer.originAirport} → {offer.destinationAirport} ·{" "}
          {offer.stops === 0 ? "Direct" : `${offer.stops} stop(s)`}
        </p>
        <p className="text-brand font-bold text-lg mt-2">
          {offer.currency} {offer.finalPrice}
        </p>
      </div>

      <form onSubmit={submit} className="px-4 space-y-3">
        <div>
          <label className="text-muted text-xs">Full Name (as on CNIC/Passport)</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-card border border-cardline rounded-xl px-4 py-3 mt-1 outline-none focus:border-brand"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-muted text-xs">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-card border border-cardline rounded-xl px-4 py-3 mt-1 outline-none focus:border-brand"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-muted text-xs">Date of Birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full bg-card border border-cardline rounded-xl px-4 py-3 mt-1 outline-none focus:border-brand"
            />
          </div>
        </div>

        <div>
          <label className="text-muted text-xs">CNIC or Passport Number</label>
          <input
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            className="w-full bg-card border border-cardline rounded-xl px-4 py-3 mt-1 outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="text-muted text-xs">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-card border border-cardline rounded-xl px-4 py-3 mt-1 outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="text-muted text-xs">Phone Number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03xxxxxxxxx"
            className="w-full bg-card border border-cardline rounded-xl px-4 py-3 mt-1 outline-none focus:border-brand"
          />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-brand hover:bg-brandDark transition-colors rounded-full py-4 font-bold text-lg mt-4"
        >
          Continue to Payment
        </button>
      </form>
    </div>
  );
}
