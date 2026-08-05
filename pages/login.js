import React, { useState } from "react";
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

  const sendMagicLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSent(false);
    if (!supabase) {
      setError("Supabase isn't configured. Check environment variables.");
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {},
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-jtWhite flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size={64} withText={true} textClass="text-2xl" />
        </div>

        <div className="bg-white rounded-2xl border border-jtBorder p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-jtNavy text-center mb-2">
            Welcome Back
          </h2>
          <p className="text-jtMuted text-center mb-6">
            Sign in to manage your bookings
          </p>

          <button
            onClick={continueAsGuest}
            className="w-full btn-primary flex items-center justify-center gap-2 mb-4"
          >
            Continue as Guest
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-jtBorder"></div>
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
              className="w-full border border-jtBorder rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-jtCyan/50 focus:border-jtCyan bg-white text-jtText"
              disabled={loading || sent}
            />

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            {sent && (
              <p className="text-green-600 text-sm mb-4">
                ✅ Magic link sent! Check your email to log in.
              </p>
            )}

            <button
              type="submit"
              disabled={loading || sent}
              className="w-full btn-secondary disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>

          <p className="text-xs text-jtMuted text-center mt-4">
            By continuing, you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
