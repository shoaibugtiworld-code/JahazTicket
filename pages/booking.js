import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Logo from "../components/Logo";
import StepIndicator from "../components/StepIndicator";
import CountdownTimer from "../components/CountdownTimer";
import DocumentScanner from "../components/DocumentScanner";
import { COUNTRIES } from "../lib/countries";
import { PHONE_CODES } from "../lib/phoneCodes";
import { supabase } from "../lib/supabaseClient";

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
  const [phoneCode, setPhoneCode] = useState("+92");
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
  const [cnic, setCnic] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [passportExpiryDay, setPassportExpiryDay] = useState("");
  const [passportExpiryMonth, setPassportExpiryMonth] = useState("");
  const [passportExpiryYear, setPassportExpiryYear] = useState("");

  const [error, setError] = useState("");
  const [saveDetails, setSaveDetails] = useState(false);

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

    // Prefill from a same-device save (works even as a guest)
    const local = localStorage.getItem("jt_saved_traveller");
    if (local) applySavedDetails(JSON.parse(local));

    // If logged in with a real account, prefer their account-linked save
    // (works across devices, not just this browser)
    const sessionData = JSON.parse(session);
    if (sessionData.type === "supabase" && supabase) {
      supabase
        .from("saved_travellers")
        .select("*")
        .eq("user_id", sessionData.userId)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            applySavedDetails({
              title: data.title,
              givenName: data.given_name,
              surname: data.surname,
              dob: data.dob,
              nationality: data.nationality,
              cnic: data.cnic,
              passportNumber: data.passport_number,
              passportExpiry: data.passport_expiry,
              phone: data.phone,
              email: data.email,
            });
            setSaveDetails(true);
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const applySavedDetails = (d) => {
    if (d.title) setTitle(d.title);
    if (d.givenName) setGivenName(d.givenName);
    if (d.surname) setSurname(d.surname);
    if (d.dob) {
      const [y, m, dd] = d.dob.split("-");
      setDobYear(y);
      setDobMonth(MONTHS[parseInt(m, 10) - 1]);
      setDobDay(String(parseInt(dd, 10)));
    }
    if (d.nationality) setNationality(d.nationality);
    if (d.cnic) setCnic(d.cnic);
    if (d.passportNumber) setPassportNumber(d.passportNumber);
    if (d.passportExpiry) {
      const [y, m, dd] = d.passportExpiry.split("-");
      setPassportExpiryYear(y);
      setPassportExpiryMonth(MONTHS[parseInt(m, 10) - 1]);
      setPassportExpiryDay(String(parseInt(dd, 10)));
    }
    if (d.email) setEmail(d.email);
    if (d.phone) {
      const matchedCode = PHONE_CODES.find((p) => d.phone.startsWith(p.dial));
      if (matchedCode) {
        setPhoneCode(matchedCode.dial);
        setMobile(d.phone.slice(matchedCode.dial.length));
      } else {
        setMobile(d.phone);
      }
    }
  };

  const applyPassportScan = (result) => {
    if (result.passportNumber) setPassportNumber(result.passportNumber);
    if (result.nationality) {
      const match = COUNTRIES.find((c) => c.code === result.nationality || c.code === result.nationality.slice(0, 2));
      if (match) setNationality(match.code);
    }
    if (result.passportExpiry) {
      const [y, m, d] = result.passportExpiry.split("-");
      setPassportExpiryYear(y);
      setPassportExpiryMonth(MONTHS[parseInt(m, 10) - 1]);
      setPassportExpiryDay(String(parseInt(d, 10)));
    }
  };

  const applyCnicScan = (result) => {
    if (result.cnic) setCnic(result.cnic);
  };

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
      cnic,
      passportNumber,
      passportExpiry,
      email,
      phone: `${phoneCode}${mobile}`,
    };
    sessionStorage.setItem("jt_contact", JSON.stringify({ mobile: `${phoneCode}${mobile}`, email }));
    sessionStorage.setItem("jt_passenger", JSON.stringify(passenger));

    if (saveDetails) {
      localStorage.setItem("jt_saved_traveller", JSON.stringify(passenger));

      const session = JSON.parse(localStorage.getItem("jt_session") || "{}");
      if (session.type === "supabase" && supabase) {
        supabase
          .from("saved_travellers")
          .upsert({
            user_id: session.userId,
            title,
            given_name: givenName,
            surname,
            dob,
            nationality,
            cnic,
            passport_number: passportNumber,
            passport_expiry: passportExpiry,
            phone: `${phoneCode}${mobile}`,
            email,
          })
          .then(() => {});
      }
    } else {
      localStorage.removeItem("jt_saved_traveller");
    }

    router.push("/addons");
  };

  if (!checked || !offer) return null;

  return (
    <div className="min-h-screen bg-jtWhite text-jtText pb-16">
      <div className="flex items-center justify-between px-4 py-5">
        <Logo />
        <button onClick={() => router.push("/")} className="text-jtMuted text-sm">
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
      <div className="mx-4 bg-white border border-jtBorder rounded-xl2 px-4 py-4 mb-6 mt-2">
        <p className="font-bold">{offer.airline}</p>
        {offer.legs.map((leg, i) => (
          <p key={i} className="text-jtMuted text-sm">
            {leg.originAirport} → {leg.destinationAirport} ·{" "}
            {leg.stops === 0 ? "Direct" : `${leg.stops} stop(s)`}
          </p>
        ))}
        <p className="text-jtNavy font-bold text-lg mt-2">
          {offer.currency} {offer.finalPrice}
        </p>
        <p className="text-jtMuted text-[11px]">This price is final — it will not change till payment.</p>
      </div>

      <form onSubmit={submit} className="px-4 space-y-6">
        {/* Contact Details */}
        <div>
          <p className="font-bold mb-1">Contact Details</p>
          <p className="text-jtMuted text-xs mb-3">Your e-ticket and trip updates will be sent here.</p>
          <div className="space-y-3">
            <div>
              <label className="text-jtMuted text-xs">Mobile Number</label>
              <div className="flex items-center gap-2 mt-1">
                <select
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  className="bg-white border border-jtBorder rounded-xl px-2 py-3 outline-none focus:border-jtCyan max-w-[110px]"
                >
                  {PHONE_CODES.map((p) => (
                    <option key={p.code} value={p.dial}>
                      {p.dial} {p.name}
                    </option>
                  ))}
                </select>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="3xxxxxxxxx"
                  className="flex-1 bg-white border border-jtBorder rounded-xl px-4 py-3 outline-none focus:border-jtCyan"
                />
              </div>
            </div>
            <div>
              <label className="text-jtMuted text-xs">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-jtBorder rounded-xl px-4 py-3 mt-1 outline-none focus:border-jtCyan"
              />
            </div>
          </div>
        </div>

        {/* Traveller Details */}
        <div>
          <p className="font-bold mb-1">Traveller Details — Adult 1</p>
          <p className="text-jtMuted text-xs mb-3">
            Enter details exactly as they appear on your passport/CNIC. Required for both domestic and
            international travel.
          </p>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-24">
                <label className="text-jtMuted text-xs">Title</label>
                <select
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-jtBorder rounded-xl px-3 py-3 mt-1 outline-none focus:border-jtCyan"
                >
                  {TITLES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="text-jtMuted text-xs">Given Name(s)</label>
                <input
                  value={givenName}
                  onChange={(e) => setGivenName(e.target.value)}
                  placeholder="As on passport/CNIC"
                  className="w-full bg-white border border-jtBorder rounded-xl px-4 py-3 mt-1 outline-none focus:border-jtCyan"
                />
              </div>
            </div>

            <div>
              <label className="text-jtMuted text-xs">Surname</label>
              <input
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="As on passport/CNIC"
                className="w-full bg-white border border-jtBorder rounded-xl px-4 py-3 mt-1 outline-none focus:border-jtCyan"
              />
            </div>

            <div>
              <label className="text-jtMuted text-xs">Date of Birth</label>
              <div className="flex gap-2 mt-1">
                <select
                  value={dobDay}
                  onChange={(e) => setDobDay(e.target.value)}
                  className="flex-1 bg-white border border-jtBorder rounded-xl px-2 py-3 outline-none focus:border-jtCyan"
                >
                  <option value="">Day</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select
                  value={dobMonth}
                  onChange={(e) => setDobMonth(e.target.value)}
                  className="flex-[1.5] bg-white border border-jtBorder rounded-xl px-2 py-3 outline-none focus:border-jtCyan"
                >
                  <option value="">Month</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={dobYear}
                  onChange={(e) => setDobYear(e.target.value)}
                  className="flex-1 bg-white border border-jtBorder rounded-xl px-2 py-3 outline-none focus:border-jtCyan"
                >
                  <option value="">Year</option>
                  {DOB_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-jtMuted text-xs">Nationality</label>
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className="w-full bg-white border border-jtBorder rounded-xl px-4 py-3 mt-1 outline-none focus:border-jtCyan"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-jtMuted text-xs">CNIC Number (for domestic Pakistan travel)</label>
              <input
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                placeholder="e.g. 12345-1234567-1"
                className="w-full bg-white border border-jtBorder rounded-xl px-4 py-3 mt-1 outline-none focus:border-jtCyan"
              />
              <DocumentScanner mode="cnic" onResult={applyCnicScan} />
            </div>

            <div>
              <label className="text-jtMuted text-xs">Passport Number</label>
              <input
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                placeholder="e.g. AB1234567"
                className="w-full bg-white border border-jtBorder rounded-xl px-4 py-3 mt-1 outline-none focus:border-jtCyan"
              />
              <DocumentScanner mode="passport" onResult={applyPassportScan} />
              <p className="text-jtMuted text-[11px] mt-1">
                Scanning also auto-fills nationality and expiry date if your passport's machine-readable
                zone is captured clearly.
              </p>
            </div>

            <div>
              <label className="text-jtMuted text-xs">Passport Expiry Date</label>
              <div className="flex gap-2 mt-1">
                <select
                  value={passportExpiryDay}
                  onChange={(e) => setPassportExpiryDay(e.target.value)}
                  className="flex-1 bg-white border border-jtBorder rounded-xl px-2 py-3 outline-none focus:border-jtCyan"
                >
                  <option value="">Day</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <select
                  value={passportExpiryMonth}
                  onChange={(e) => setPassportExpiryMonth(e.target.value)}
                  className="flex-[1.5] bg-white border border-jtBorder rounded-xl px-2 py-3 outline-none focus:border-jtCyan"
                >
                  <option value="">Month</option>
                  {MONTHS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={passportExpiryYear}
                  onChange={(e) => setPassportExpiryYear(e.target.value)}
                  className="flex-1 bg-white border border-jtBorder rounded-xl px-2 py-3 outline-none focus:border-jtCyan"
                >
                  <option value="">Year</option>
                  {EXPIRY_YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <p className="text-jtMuted text-[11px] mt-1">
                Must be valid (not expired) — many countries also require 6 months validity beyond travel date.
              </p>
            </div>
          </div>
        </div>

        <label className="flex items-start gap-3 bg-white border border-jtBorder rounded-xl px-4 py-3 cursor-pointer">
          <input
            type="checkbox"
            checked={saveDetails}
            onChange={(e) => setSaveDetails(e.target.checked)}
            className="mt-1 w-4 h-4 accent-jtCyan"
          />
          <span className="text-sm">
            <span className="font-medium text-jtText">Save my details for next time</span>
            <span className="block text-jtMuted text-xs mt-0.5">
              We'll fill this form in automatically on your next booking.
            </span>
          </span>
        </label>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full bg-jtOrange hover:bg-jtOrangeDark transition-colors rounded-full py-4 font-bold text-lg text-white"
        >
          Review Details — {offer.currency} {offer.finalPrice}
        </button>
      </form>
    </div>
  );
}
