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
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ maxWidth: "448px", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
          <Logo size={64} withText={true} textClass="text-2xl" />
        </div>

        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "16px", border: "1px solid #E2E8F0", padding: "32px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#0B2545", textAlign: "center", marginBottom: "8px" }}>
            Welcome Back
          </h2>
          <p style={{ color: "#64748B", textAlign: "center", marginBottom: "24px" }}>
            Sign in to manage your bookings
          </p>

          <button
            onClick={continueAsGuest}
            className="btn-primary"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "16px" }}
          >
            Continue as Guest
          </button>

          <div style={{ position: "relative", margin: "24px 0" }}>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center" }}>
              <div style={{ width: "100%", borderTop: "1px solid #E2E8F0" }}></div>
            </div>
            <div style={{ position: "relative", display: "flex", justifyContent: "center", fontSize: "14px" }}>
              <span style={{ padding: "0 8px", backgroundColor: "#FFFFFF", color: "#64748B" }}>or</span>
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
              style={{
                width: "100%",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                padding: "12px 16px",
                marginBottom: "16px",
                backgroundColor: "#FFFFFF",
                color: "#1E293B",
                outline: "none",
              }}
              onFocus={(e) => e.target.style.borderColor = "#00A8E8"}
              onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
            />

            {error && (
              <p style={{ color: "#EF4444", fontSize: "14px", marginBottom: "16px" }}>{error}</p>
            )}

            {sent && (
              <p style={{ color: "#22C55E", fontSize: "14px", marginBottom: "16px" }}>
                ✅ Magic link sent! Check your email to log in.
              </p>
            )}

            <button
              type="submit"
              disabled={loading || sent}
              className="btn-secondary"
              style={{ width: "100%", opacity: (loading || sent) ? 0.6 : 1, cursor: (loading || sent) ? "not-allowed" : "pointer" }}
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>

          <p style={{ fontSize: "12px", color: "#64748B", textAlign: "center", marginTop: "16px" }}>
            By continuing, you agree to our Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
