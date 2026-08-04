import { useEffect, useState } from "react";

export default function CountdownTimer({ expiresAt }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    if (!expiresAt) return;
    const target = new Date(expiresAt).getTime();

    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setRemaining(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!expiresAt || remaining === null) return null;

  const totalSeconds = Math.floor(remaining / 1000);
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(totalSeconds % 60).padStart(2, "0");

  return (
    <div className="text-right">
      <p className="text-muted text-xs">Finish booking in</p>
      <p className={`font-bold text-sm ${totalSeconds < 60 ? "text-red-400" : "text-brand"}`}>
        {h}:{m}:{s}
      </p>
    </div>
  );
}
