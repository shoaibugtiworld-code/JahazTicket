import Link from "next/link";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

export default function Contact() {
  return (
    <div className="min-h-screen bg-jtWhite text-jtText">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-jtBorder">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/"><Logo size={36} withText textClass="text-lg" /></Link>
          <Link href="/" className="text-sm font-semibold text-jtCyan">Back to search</Link>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display text-3xl font-extrabold text-jtNavy mb-6">Contact Us</h1>
        <p className="text-jtText mb-8">
          Have a question about a booking, or need help before you fly? Reach us any of these ways:
        </p>

        <div className="space-y-4">
          <div className="bg-white border border-jtBorder rounded-2xl p-5">
            <p className="font-semibold text-jtNavy">Email</p>
            <p className="text-jtMuted text-sm mt-1">support@jahaztikket.com</p>
          </div>
          <div className="bg-white border border-jtBorder rounded-2xl p-5">
            <p className="font-semibold text-jtNavy">WhatsApp</p>
            <p className="text-jtMuted text-sm mt-1">Add your WhatsApp Business number here once set up</p>
          </div>
          <div className="bg-white border border-jtBorder rounded-2xl p-5">
            <p className="font-semibold text-jtNavy">Business Address</p>
            <p className="text-jtMuted text-sm mt-1">Sui, Dera Bugti, Balochistan, Pakistan</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
