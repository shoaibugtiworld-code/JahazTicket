const STEPS = ["Booking", "Add-ons", "Payment", "E-Ticket"];

export default function StepIndicator({ current }) {
  const currentIndex = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-2 shrink-0">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              i <= currentIndex ? "bg-brand text-black" : "bg-cardline text-muted"
            }`}
          >
            {i + 1}
          </span>
          <span className={`text-xs ${i <= currentIndex ? "text-white" : "text-muted"}`}>{step}</span>
          {i < STEPS.length - 1 && <span className="w-4 h-px bg-cardline mx-1" />}
        </div>
      ))}
    </div>
  );
}
