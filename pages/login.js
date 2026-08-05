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
  <div className="min-h-screen bg-jtWhite flex items-center justify-center px-4">
  <div className="w-full max-w-md">
    {/* Logo centered */}
    <div className="flex justify-center mb-8">
      <Logo size={64} withText={true} textClass="text-2xl" />
    </div>
    
    <div className="bg-white rounded-2xl border border-jtBorder p-8 shadow-xl">
      <h2 className="text-2xl font-bold text-jtNavy text-center mb-2">Welcome Back</h2>
      <p className="text-jtMuted text-center mb-6">Sign in to manage your bookings</p>
      
      <button className="w-full btn-primary flex items-center justify-center gap-2 mb-4">
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
      
      <input 
        type="email" 
        placeholder="Enter your email" 
        className="w-full border border-jtBorder rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-jtCyan/50 focus:border-jtCyan"
      />
      <button className="w-full btn-secondary">Send Magic Link</button>
    </div>
  </div>
</div>
  );
}
