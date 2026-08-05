import Link from "next/link";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-jtWhite text-jtText">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-jtBorder">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/"><Logo size={36} withText textClass="text-lg" /></Link>
          <Link href="/" className="text-sm font-semibold text-jtCyan">Back to search</Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-jtText leading-relaxed">
        <h1 className="font-display text-3xl font-extrabold text-jtNavy mb-2">Privacy Policy</h1>
        <p className="text-jtMuted text-sm">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long" })}</p>

        <div>
          <h2 className="font-semibold text-jtNavy mb-1">Information we collect</h2>
          <p>
            To search and book flights, we collect contact details (email, phone), traveller details
            (name, date of birth, nationality, passport/CNIC number), and payment information processed
            securely by our payment partners.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-jtNavy mb-1">How we use it</h2>
          <p>
            Your information is used to search flights, complete bookings with airlines, issue your
            e-ticket, and contact you about your trip. We do not sell your personal information to
            third parties.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-jtNavy mb-1">Sharing with airlines and partners</h2>
          <p>
            Booking a flight requires sharing traveller details with the airline and our flight-booking
            partner (Duffel) to issue your ticket, and with our payment partner to process payment.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-jtNavy mb-1">Your rights</h2>
          <p>
            You can request a copy of the data we hold about you, or ask us to delete it, by emailing
            support@jahaztikket.com.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
