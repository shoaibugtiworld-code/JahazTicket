import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import Logo from "../components/Logo";

export default function Login() {
  const router = useRouter();

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
    if (!supabase) return;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-jtNavy via-[#0d2e52] to-jtNavyDark flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
          <path d="M0,300 Q300,100 600,300 T1200,300" fill="none" stroke="#00A8E8" strokeWidth="2" />
          <path d="M0,400 Q400,200 800,400 T1200,400" fill="none" stroke="#00A8E8" strokeWidth="1.5" />
        </svg>
      </div>

      <div className="max-w-md w-full relative">
        <div className="flex justify-center mb-8">
          <Logo size="large" withText textClass="text-2xl" />
        </div>

        <div className="bg-white rounded-3xl border border-jtBorder p-8 shadow-2xl">
          <h2 className="font-display text-2xl font-bold text-jtNavy text-center mb-1">Welcome to Jahaz Ticket</h2>
          <p className="text-jtMuted text-center mb-8 text-sm">
            One clear price, every time you fly.
          </p>

          <button
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 border border-jtBorder rounded-xl py-3.5 font-semibold text-jtText hover:bg-gray-50 hover:border-jtCyan/40 transition-all mb-3 shadow-sm"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34 5.1 29.3 3 24 3 16.3 3 9.7 7.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 45c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 36.4 26.7 37 24 37c-5.2 0-9.6-3.3-11.3-8l-6.6 5.1C9.6 40.6 16.2 45 24 45z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.2 5.2C40.9 36 44 30.6 44 24c0-1.4-.1-2.7-.4-3.5z" />
            </svg>
            Continue with Google
          </button>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-jtBorder" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-jtMuted uppercase tracking-wide">or</span>
            </div>
          </div>

          <button
            onClick={continueAsGuest}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            Continue as Guest
          </button>

          <p className="text-xs text-jtMuted text-center mt-6">
            By continuing, you agree to our{" "}
            <a href="/terms" className="text-jtCyan underline">Terms</a> &amp;{" "}
            <a href="/privacy" className="text-jtCyan underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
