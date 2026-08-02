import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const continueAsGuest = () => {
    // Guest session — no account needed, can search + see prices.
    // Booking/payment step can require real login later.
    localStorage.setItem("jt_session", JSON.stringify({ type: "guest" }));
    router.push("/");
  };

  const sendMagicLink = async (e) => {
    e.preventDefault();
    setError("");
    if (!supabase) {
      setError("Supabase isn't configured yet. Check environment variables.");
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-white flex flex-col justify-center px-6">
      <div className="max-w-sm mx-auto w-full">
        <h1 className="text-3xl font-bold mb-1">Jahaz Ticket</h1>
        <p className="text-muted mb-8">Every flight, one clear price.</p>

        {!sent ? (
          <form onSubmit={sendMagicLink} className="space-y-3">
            <input
              type="email"
              required
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-card border border-cardline rounded-xl px-4 py-3 text-white placeholder-muted outline-none focus:border-brand"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brandDark transition-colors rounded-full py-3 font-semibold disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send login link"}
            </button>
          </form>
        ) : (
          <p className="text-muted">
            We sent a login link to <span className="text-white">{email}</span>. Open it to sign in.
          </p>
        )}

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-cardline" />
          <span className="text-muted text-sm">or</span>
          <div className="h-px flex-1 bg-cardline" />
        </div>

        <button
          onClick={continueAsGuest}
          className="w-full border border-cardline rounded-full py-3 font-semibold hover:border-brand transition-colors"
        >
          Continue as guest
        </button>
      </div>
    </div>
  );
}
