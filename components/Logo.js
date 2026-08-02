export default function Logo({ size = "default" }) {
  const isLarge = size === "large";
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center justify-center rounded-full bg-brand text-black ${
          isLarge ? "w-10 h-10 text-xl" : "w-8 h-8 text-base"
        }`}
      >
        ✈
      </span>
      <span className={`font-extrabold tracking-tight ${isLarge ? "text-2xl" : "text-lg"}`}>
        Jahaz<span className="text-brand">Ticket</span>
      </span>
    </div>
  );
          }
