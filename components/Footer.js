import Link from "next/link";
import { useRouter } from "next/router";
import Logo from "./Logo";

// city name -> { code, label } used to build a real, working search link
const CITY = {
  Karachi: { code: "KHI", label: "Karachi (KHI)" },
  Islamabad: { code: "ISB", label: "Islamabad (ISB)" },
  Lahore: { code: "LHE", label: "Lahore (LHE)" },
  Dubai: { code: "DXB", label: "Dubai (DXB)" },
  Jeddah: { code: "JED", label: "Jeddah (JED)" },
  London: { code: "LON", label: "London — All airports" },
  "New York": { code: "NYC", label: "New York — All airports" },
  Paris: { code: "CDG", label: "Paris (CDG)" },
  Singapore: { code: "SIN", label: "Singapore (SIN)" },
  Toronto: { code: "YYZ", label: "Toronto (YYZ)" },
  Doha: { code: "DOH", label: "Doha (DOH)" },
  Istanbul: { code: "IST", label: "Istanbul (IST)" },
  "Los Angeles": { code: "LAX", label: "Los Angeles (LAX)" },
  Sydney: { code: "SYD", label: "Sydney (SYD)" },
};

// One global list — no "domestic vs international" framing, so the platform
// reads as a worldwide booking site rather than a Pakistan-only one.
const AIRLINES = [
  { name: "Emirates", hub: "Dubai" },
  { name: "Qatar Airways", hub: "Doha" },
  { name: "Etihad Airways", hub: "Dubai" },
  { name: "Turkish Airlines", hub: "Istanbul" },
  { name: "British Airways", hub: "London" },
  { name: "Singapore Airlines", hub: "Singapore" },
  { name: "Cathay Pacific", hub: "London" },
  { name: "Lufthansa", hub: "Paris" },
  { name: "Air France", hub: "Paris" },
  { name: "American Airlines", hub: "New York" },
  { name: "Pakistan International Airlines", hub: "Karachi" },
  { name: "flydubai", hub: "Dubai" },
];

const POPULAR_ROUTES = [
  ["Karachi", "Dubai"],
  ["Lahore", "London"],
  ["Islamabad", "Dubai"],
  ["London", "Dubai"],
  ["New York", "London"],
  ["Singapore", "Dubai"],
  ["Dubai", "Istanbul"],
  ["Karachi", "Jeddah"],
  ["Toronto", "London"],
  ["Los Angeles", "Dubai"],
  ["Doha", "London"],
  ["Sydney", "Singapore"],
];

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
  { label: "Manage Booking", href: "/manage-booking" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

function Column({ title, children }) {
  return (
    <div>
      <p className="text-jtMuted text-xs uppercase tracking-wide mb-3">{title}</p>
      {children}
    </div>
  );
}

export default function Footer() {
  const router = useRouter();
  const year = new Date().getFullYear();

  const goToRoute = (fromCity, toCity) => {
    const from = CITY[fromCity];
    const to = CITY[toCity];
    if (!from || !to) return;
    const date = new Date();
    date.setDate(date.getDate() + 7);
    const dateStr = date.toISOString().slice(0, 10);
    router.push(
      `/?fromCode=${from.code}&fromLabel=${encodeURIComponent(from.label)}&toCode=${to.code}&toLabel=${encodeURIComponent(
        to.label
      )}&date=${dateStr}&auto=1`
    );
  };

  return (
    <footer className="mt-12 border-t border-jtBorder bg-white">
      <div className="px-4 py-8 space-y-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 gap-6">
          <Column title="Popular Airlines">
            <ul className="space-y-1.5 text-sm">
              {AIRLINES.slice(0, 6).map((a) => (
                <li key={a.name}>
                  <button
                    onClick={() => goToRoute("Karachi", a.hub)}
                    className="text-jtCyan underline decoration-jtCyan/40 underline-offset-2 hover:decoration-jtCyan transition-colors text-left"
                  >
                    {a.name}
                  </button>
                </li>
              ))}
            </ul>
          </Column>
          <Column title="More Airlines">
            <ul className="space-y-1.5 text-sm">
              {AIRLINES.slice(6).map((a) => (
                <li key={a.name}>
                  <button
                    onClick={() => goToRoute("Karachi", a.hub)}
                    className="text-jtCyan underline decoration-jtCyan/40 underline-offset-2 hover:decoration-jtCyan transition-colors text-left"
                  >
                    {a.name}
                  </button>
                </li>
              ))}
            </ul>
          </Column>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Column title="Popular Routes">
            <ul className="space-y-1.5 text-sm">
              {POPULAR_ROUTES.slice(0, 6).map(([from, to]) => (
                <li key={`${from}-${to}`}>
                  <button
                    onClick={() => goToRoute(from, to)}
                    className="text-jtCyan underline decoration-jtCyan/40 underline-offset-2 hover:decoration-jtCyan transition-colors text-left"
                  >
                    {from} → {to}
                  </button>
                </li>
              ))}
            </ul>
          </Column>
          <Column title="Worldwide Routes">
            <ul className="space-y-1.5 text-sm">
              {POPULAR_ROUTES.slice(6).map(([from, to]) => (
                <li key={`${from}-${to}`}>
                  <button
                    onClick={() => goToRoute(from, to)}
                    className="text-jtCyan underline decoration-jtCyan/40 underline-offset-2 hover:decoration-jtCyan transition-colors text-left"
                  >
                    {from} → {to}
                  </button>
                </li>
              ))}
            </ul>
          </Column>
        </div>

        <Column title="We Accept">
          <p className="text-sm">Visa · Mastercard · Google Pay · International Payments</p>
        </Column>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm border-t border-jtBorder pt-6">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-jtCyan underline decoration-jtCyan/40 underline-offset-2 hover:decoration-jtCyan cursor-pointer"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="pt-2">
          <Logo />
          <p className="text-jtMuted text-xs mt-3">© {year} Jahaz Ticket. Fly anywhere, one clear price.</p>
        </div>
      </div>
    </footer>
  );
}
