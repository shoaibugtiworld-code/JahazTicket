import Link from "next/link";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-jtWhite text-jtText">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-jtBorder">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/"><Logo size={36} withText textClass="text-lg" /></Link>
          <Link href="/" className="text-sm font-semibold text-jtCyan">Back to search</Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display text-3xl font-extrabold text-jtNavy mb-6">About Jahaz Ticket</h1>

        <div className="space-y-5 text-jtText leading-relaxed">
          <p>
            Jahaz Ticket was built on one simple idea: the price you see should be the price you pay.
            No surprise fees at checkout, no "convenience charges" that appear right before payment —
            just one honest, all-inclusive price from search to e-ticket.
          </p>
          <p>
            Our fee is shown upfront, built into the fare the moment you search — never added on later.
            We believe that's how flight booking should work everywhere.
          </p>
          <p>
            We're a Pakistan-based team, currently focused on international flights, with domestic routes
            on the way as we grow our airline partnerships.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
