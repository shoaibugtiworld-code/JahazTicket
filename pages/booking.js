import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Logo from "../components/Logo";
import StepIndicator from "../components/StepIndicator";
import CountdownTimer from "../components/CountdownTimer";
import { COUNTRIES } from "../lib/countries";

const TITLES = ["Mr", "Mrs", "Ms"];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const CURRENT_YEAR = new Date().getFullYear();
const DOB_YEARS = Array.from({ length: 100 }, (_, i) => CURRENT_YEAR - i);
const EXPIRY_YEARS = Array.from({ length: 15 }, (_, i) => CURRENT_YEAR + i);

export default function Booking() {
  const router = useRouter();
  const [offer, setOffer] = useState(null);
  const [checked, setChecked] = useState(false);

  // Contact details
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");

  // Traveller details
  const [title, setTitle] = useState("Mr");
  const [givenName, setGivenName] = useState("");
  const [surname, setSurname] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [nationality, setNationality] = useState("PK");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportExpiryDay, setPassportExpiryDay] = useState("");
  const [passportExpiryMonth, setPassportExpiryMonth] = useState("");
  const [passportExpiryYear, setPassportExpiryYear] = useState("");

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
    if (!mobile || !email) {
      setError("Please fill in your mobile number and email");
      return;
    }
    if (!givenName || !surname || !dobDay || !dobMonth || !dobYear) {
      setError("Please fill in name and date of birth");
      return;
    }
    if (!nationality || !passportNumber || !passportExpiryDay || !passportExpiryMonth || !passportExpiryYear) {
      setError("Nationality, passport number and passport expiry are required — even for domestic travel");
      return;
    }

    const dobMonthIndex = String(MONTHS.indexOf(dobMonth) + 1).padStart(2, "0");
    const dob = `${dobYear}-${dobMonthIndex}-${String(dobDay).padStart(2, "0")}`;

    const expiryMonthIndex = String(MONTHS.indexOf(passportExpiryMonth) + 1).padStart(2, "0");
    const passportExpiry = `${passportExpiryYear}-${expiryMonthIndex}-${String(passportExpiryDay).padStart(2, "0")}`;

    if (new Date(passportExpiry) <= new Date()) {
      setError("Passport has expired — please use a valid, non-expired passport");
      return;
    }

    const gender = title === "Mr" ? "male" : "female";

    const passenger = {
      title,
      givenName,
      surname,
      gender,
      dob,
      nationality,
      passportNumber,
      passportExpiry,
      email,
      phone: mobile,
    };
    sessionStorage.setItem("jt_contact", JSON.stringify({ mobile, email }));
    sessionStorage.setItem("jt_passenger", JSON.stringify(passenger));
    router.push("/addons");
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

      <div className="flex items-center justify-between">
        <StepIndicator current="Booking" />
        <div className="pr-4">
          <CountdownTimer expiresAt={offer.expiresAt} />
        </div>
      </div>

      {/* Selected flight summary */}
      <div className="mx-4 bg-card border border-cardline rounded-xl2 px-4 py-4 mb-6 mt-2">
        <p className="font-bold">{offer.airline}</p>
        {offer.legs.map((leg, i) => (
          <p key={i} className="text-muted text-sm">
            {leg.originAirport} → {leg.destinationAirport} ·{" "}
            {leg.stops === 0 ? "Direct" : `${leg.stops} stop(s)`}
          </p>
        ))}
        <p className="text-brand font-bold text-lg mt-2">
          {offer.currency} {offer.finalPrice}
        </p>
        <p className="text-muted text-[11px]">This price is final — it will not change till payment.</p>
      </div>

      <form onSubmit={submit} className="px-4 space-y-6">
        {/* Contact Details */}
        <div>
          <p className="font-bold mb-1">Contact Details</p>
          <p className="text-muted text-xs mb-3">Your e-ticket and trip updates will be sent here.</p>
          <div className="space-y-3">
            <div>
              <label className="text-muted text-xs">Mobile Number</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="bg-card border border-cardline rounded-xl px-3 py-3 text-muted">+92</span>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="3xxxxxxxxx"
                  className="flex-1 bg-card border border-cardline rounded-xl px-4 py-3 outline-none focus:border-brand"
                />
              </div>
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
          </div>
        </div>

        {/* Traveller Details */}
        <div>
          <p className="font-bold mb-1">Traveller Details — Adult 1</p>
          <p className="text-muted text-xs mb-3">
            Enter details exactly as they appear on your passport/CNIC. Required for both domestic and
            international travel.
          </p>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-24">
                <label className="text-muted text-xs">Title</label>
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-card border border-cardline rounded-xl px-3 py-3 mt-1 outline-none focus:border-brand"
                >
                  {TITLES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-muted text-xs">Given Name(s)</label>
                <input
                  value={givenName}
                  onChange={(e) => setGivenName(e.target.value)}
                  placeholder="As on passport/CNIC"
                  className="w-full bg-card border border-cardline rounded-xl px-4 py-3 mt-1 outline-none focus:border-brand"
                />
              </div>
            </div>

            <div>
              <label className="text-muted text-xs">Surname</label>
              <input
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="As on passport/CNIC"
                className="w-full bg-card border border-cardline rounded-xl px-4 py-3 mt-1 outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="text-muted text-xs">Date of Birth</label>
              <div className="flex gap-2 mt-1">
                <select
                  value={dobDay}
                  onChange={(e) => setDobDay(e.target.value)}
                  className="flex-1 bg-card border border-cardline rounded-xl px-2 py-3 outline-none focus:border-brand"
                >
                  <option value="">Day</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select
                  value={dobMonth}
                  onChange={(e) => setDobMonth(e.target.value)}
                  className="flex-[1.5] bg-card border border-cardline rounded-xl px-2 py-3 outline-none focus:border-brand"
                >
                  <option value="">Month</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={dobYear}
                  onChange={(e) => setDobYear(e.target.value)}
                  className="flex-1 bg-card border border-cardline rounded-xl px-2 py-3 outline-none focus:border-brand"
                >
                  <option value="">Year</option>
                  {DOB_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-muted text-xs">Nationality</label>
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full bg-card border border-cardline rounded-xl px-4 py-3 mt-1 outline-none focus:border-brand"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-muted text-xs">Passport Number</label>
              <input
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                placeholder="e.g. AB1234567"
                className="w-full bg-card border border-cardline rounded-xl px-4 py-3 mt-1 outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="text-muted text-xs">Passport Expiry Date</label>
              <div className="flex gap-2 mt-1">
                <select
                  value={passportExpiryDay}
                  onChange={(e) => setPassportExpiryDay(e.target.value)}
                  className="flex-1 bg-card border border-cardline rounded-xl px-2 py-3 outline-none focus:border-brand"
                >
                  <option value="">Day</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select
                  value={passportExpiryMonth}
                  onChange={(e) => setPassportExpiryMonth(e.target.value)}
                  className="flex-[1.5] bg-card border border-cardline rounded-xl px-2 py-3 outline-none focus:border-brand"
                >
                  <option value="">Month</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={passportExpiryYear}
                  onChange={(e) => setPassportExpiryYear(e.target.value)}
                  className="flex-1 bg-card border border-cardline rounded-xl px-2 py-3 outline-none focus:border-brand"
                >
                  <option value="">Year</option>
                  {EXPIRY_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <p className="text-muted text-[11px] mt-1">
                Must be valid (not expired) — many countries also require 6 months validity beyond travel date.
              </p>
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-brand hover:bg-brandDark transition-colors rounded-full py-4 font-bold text-lg"
        >
          Review Details — {offer.currency} {offer.finalPrice}
        </button>
      </form>
    </div>
  );
}
