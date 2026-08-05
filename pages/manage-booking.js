import { useState } from "react";
import Link from "next/link";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

export default function ManageBooking() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-jtWhite text-jtText">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-jtBorder">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/"><Logo size={36} withText textClass="text-lg" /></Link>
          <Link href="/" className="text-sm font-semibold text-jtCyan">Back to search</Link>
        </div>
      </header>

      <section className="max-w-lg mx-auto px-4 py-12">
        <h1 className="font-display text-3xl font-extrabold text-jtNavy mb-2">Manage Booking</h1>
        <p className="text-jtMuted mb-6">Look up your booking using your reference number and email.</p>

        {!submitted ? (
          <form onSubmit={submit} className="bg-white border border-jtBorder rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-jtMuted text-xs">Booking Reference</label>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                placeholder="e.g. JT4F82K"
                required
                className="w-full border border-jtBorder rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-jtCyan/50 focus:border-jtCyan bg-white text-jtText"
              />
            </div>
            <div>
              <label className="text-jtMuted text-xs">Email used at booking</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-jtBorder rounded-xl px-4 py-3 mt-1 outline-none focus:ring-2 focus:ring-jtCyan/50 focus:border-jtCyan bg-white text-jtText"
              />
            </div>
            <button type="submit" className="btn-primary w-full">Find My Booking</button>
          </form>
        ) : (
          <div className="bg-white border border-jtBorder rounded-2xl p-5">
            <p className="font-semibold text-jtNavy mb-2">Online lookup is coming soon</p>
            <p className="text-jtMuted text-sm">
              We're still building automatic booking lookup. For now, please email{" "}
              <span className="text-jtText font-medium">support@jahaztikket.com</span> with your reference (
              {reference}) and we'll help you directly.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
          }
                  
