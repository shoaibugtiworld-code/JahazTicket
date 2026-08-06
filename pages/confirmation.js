import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Logo from "../components/Logo";
import Footer from "../components/Footer";

export default function Confirmation() {
  const router = useRouter();
  const [status, setStatus] = useState("checking"); // checking | booked | failed | pending
  const [reference, setReference] = useState(null);

  useEffect(() => {
    if (!router.isReady) return;
    const { bookingId } = router.query;
    if (!bookingId) return;

    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      try {
        const res = await fetch(`/api/bookings/status?id=${bookingId}`);
        const data = await res.json();
        if (data.status === "booked") {
          setStatus("booked");
          setReference(data.booking_reference);
          return;
        }
        if (data.status === "payment_received_booking_failed") {
          setStatus("failed");
          return;
        }
        // still "pending" or "paid" — Duffel booking is in progress, keep checking
        if (attempts < 15) {
          setTimeout(poll, 2000);
        } else {
          setStatus("pending");
        }
      } catch {
        if (attempts < 15) setTimeout(poll, 2000);
      }
    };
    poll();
  }, [router.isReady, router.query]);

  return (
    <div className="min-h-screen bg-jtWhite text-jtText">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-jtBorder">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <Logo size={36} withText textClass="text-lg" />
        </div>
      </header>

      <section className="max-w-lg mx-auto px-4 py-16 text-center">
        {status === "checking" && (
          <>
            <p className="text-4xl mb-4">⏳</p>
            <h1 className="font-display text-2xl font-bold text-jtNavy mb-2">Confirming your payment...</h1>
            <p className="text-jtMuted">This usually takes a few seconds. Please don't close this page.</p>
          </>
        )}
        {status === "booked" && (
          <>
            <p className="text-4xl mb-4">✅</p>
            <h1 className="font-display text-2xl font-bold text-jtNavy mb-2">Booking Confirmed!</h1>
            <p className="text-jtMuted mb-1">Your booking reference:</p>
            <p className="text-xl font-bold text-jtCyan mb-4">{reference}</p>
            <p className="text-jtMuted">Your e-ticket has been emailed to you.</p>
          </>
        )}
        {status === "pending" && (
          <>
            <p className="text-4xl mb-4">🕐</p>
            <h1 className="font-display text-2xl font-bold text-jtNavy mb-2">Still finalising your ticket</h1>
            <p className="text-jtMuted">
              Your payment was received. We're finishing the booking with the airline — this can take a
              little longer than usual. We'll email you as soon as it's confirmed.
            </p>
          </>
        )}
        {status === "failed" && (
          <>
            <p className="text-4xl mb-4">⚠️</p>
            <h1 className="font-display text-2xl font-bold text-jtNavy mb-2">We need to sort this out</h1>
            <p className="text-jtMuted">
              Your payment was received, but we couldn't complete the airline booking automatically.
              Please contact support@jahaztikket.com with your payment details — we'll fix this personally.
            </p>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
