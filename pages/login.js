import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import Logo from "../components/Logo";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Whenever Supabase reports a real signed-in session (Google OAuth redirect,
  // or clicking the magic-link email), mirror it into our own jt_session key
  // so the rest of the app's simple session check works the same way it
  // already does for guests.
  useEffect(() => {
    if (!supabase) return;
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        localStorage.setItem(
          "jt_session",
          JSON.stringify({ type: "supabase", userId: session.user.id, email: session.user.email })
        );
        router.push("/");
      }
    });
    return () => listener?.subscription?.unsubscribe();
  }, [router]);

  const continueAsGuest = () => {
    localStorage.setItem("jt_session", JSON.stringify({ type: "guest" }));
    router.push("/");
  };

  const signInWithGoogle = async () => {
    if (!supabase) {
      setError("Supabase isn't configured.");
      return;
    }
    setError("");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
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

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 border border-jtBorder rounded-xl py-3 font-semibold text-jtText hover:bg-gray-50 transition-colors mb-3"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 16.3 3 9.7 7.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.4 26.7 37 24 37c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.6 40.6 16.2 45 24 45z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C40.9 36 44 30.6 44 24c0-1.4-.1-2.7-.4-3.5z" />
            </svg>
            Continue with Google
          </button>

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
