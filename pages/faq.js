import Link from "next/link";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

const FAQS = [
  {
    q: "Does the price change after I search?",
    a: "No. The price shown in search results is final and all-inclusive — our fee is already built in. It will not change through booking, add-ons, or payment.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Visa, Mastercard, JazzCash and EasyPaisa.",
  },
  {
    q: "Do you offer domestic Pakistan flights?",
    a: "Not yet. We currently support international flights only, with domestic routes planned as we add more airline partnerships.",
  },
  {
    q: "How do I get my e-ticket?",
    a: "Your e-ticket is emailed to the address you provide at booking, right after payment is confirmed.",
  },
  {
    q: "Can I book for someone else?",
    a: "Yes. Just enter the traveller's details (not your own) in the Traveller Details step.",
  },
  {
    q: "What documents do I need?",
    a: "A valid, non-expired passport is required for all bookings — nationality, passport number and expiry date. CNIC is also collected where relevant.",
  },
];

export default function FAQ() {
  return (
    <div className="min-h-screen bg-jtWhite text-jtText">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-jtBorder">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/"><Logo size={36} withText textClass="text-lg" /></Link>
          <Link href="/" className="text-sm font-semibold text-jtCyan">Back to search</Link>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="font-display text-3xl font-extrabold text-jtNavy mb-6">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {FAQS.map((item) => (
            <div key={item.q} className="bg-white border border-jtBorder rounded-2xl p-5">
              <p className="font-semibold text-jtNavy mb-1">{item.q}</p>
              <p className="text-jtMuted text-sm">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
