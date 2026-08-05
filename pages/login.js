import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import Logo from "../components/Logo";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const continueAsGuest = () => {
    localStorage.setItem("jt_session", JSON.stringify({ type: "guest" }));
    router.push("/");
  };

  const sendMagicLink = async (e) => {
    e.preventDefault();
    setError("");
    setSent(false);
    if (!supabase) {
      setError("Supabase isn't configured.");
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-jtWhite flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-8">
          <Logo size="large" withText textClass="text-2xl" />
        </div>

        <div className="bg-white rounded-2xl border border-jtBorder p-8 shadow-xl">
          <h2 className="font-display text-2xl font-bold text-jtNavy text-center mb-2">Welcome Back</h2>
          <p className="text-jtMuted text-center mb-6">Sign in to manage your bookings</p>

          <button onClick={continueAsGuest} className="btn-primary w-full flex items-center justify-center gap-2 mb-4">
            Continue as Guest
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-jtBorder" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-jtMuted">or</span>
            </div>
          </div>

          <form onSubmit={sendMagicLink}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading || sent}
              className="w-full border border-jtBorder rounded-xl px-4 py-3 mb-4 bg-white text-jtText outline-none focus:ring-2 focus:ring-jtCyan/50 focus:border-jtCyan"
            />

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {sent && (
              <p className="text-green-600 text-sm mb-4">✅ Magic link sent! Check your email to log in.</p>
            )}

            <button type="submit" disabled={loading || sent} className="btn-secondary w-full">
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>

          <p className="text-xs text-jtMuted text-center mt-4">
            By continuing, you agree to our Terms &amp; Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
