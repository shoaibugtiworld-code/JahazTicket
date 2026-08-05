import Link from "next/link";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-jtWhite text-jtText">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-jtBorder">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/"><Logo size={36} withText textClass="text-lg" /></Link>
          <Link href="/" className="text-sm font-semibold text-jtCyan">Back to search</Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-jtText leading-relaxed">
        <h1 className="font-display text-3xl font-extrabold text-jtNavy mb-2">Terms &amp; Conditions</h1>
        <p className="text-jtMuted text-sm">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long" })}</p>

        <div>
          <h2 className="font-semibold text-jtNavy mb-1">Pricing</h2>
          <p>
            The price shown at search is final and all-inclusive of our service fee. It will not
            increase during booking, add-ons, or payment.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-jtNavy mb-1">Booking accuracy</h2>
          <p>
            You're responsible for entering traveller names, dates of birth, and passport/CNIC details
            exactly as they appear on official documents. Airlines may deny boarding for mismatched
            details, and name changes after ticketing may not be possible or may carry airline fees.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-jtNavy mb-1">Cancellations &amp; changes</h2>
          <p>
            Cancellation, change, and refund rules are set by the operating airline's fare conditions,
            not by Jahaz Ticket. We'll help you process any request but cannot override airline policy.
          </p>
        </div>
        <div>
          <h2 className="font-semibold text-jtNavy mb-1">Our role</h2>
          <p>
            Jahaz Ticket is a booking platform, not the operating airline. Flights are issued through
            our flight-booking partner (Duffel) directly with the airline.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
