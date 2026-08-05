import Link from "next/link";
import { useRouter } from "next/router";
import Logo from "./Logo";

// city name -> { code, label } used to build a real, working search link
const CITY = {
  Karachi: { code: "KHI", label: "Karachi (KHI)" },
  Islamabad: { code: "ISB", label: "Islamabad (ISB)" },
  Lahore: { code: "LHE", label: "Lahore (LHE)" },
  Peshawar: { code: "PEW", label: "Peshawar (PEW)" },
  Dubai: { code: "DXB", label: "Dubai (DXB)" },
  Jeddah: { code: "JED", label: "Jeddah (JED)" },
  Madinah: { code: "MED", label: "Madinah (MED)" },
  London: { code: "LON", label: "London — All airports" },
};

const DOMESTIC_AIRLINES = [
  { name: "Airblue", hub: "Lahore" },
  { name: "Air Sial", hub: "Lahore" },
  { name: "Pakistan International Airlines", hub: "Karachi" },
  { name: "Serene Air", hub: "Islamabad" },
  { name: "Fly Jinnah", hub: "Karachi" },
];

const INTERNATIONAL_AIRLINES = [
  { name: "Emirates", hub: "Dubai" },
  { name: "Qatar Airways", hub: "Dubai" }, // Duffel route search only, not a carrier filter — see note below
  { name: "Etihad Airways", hub: "Dubai" },
  { name: "Saudia", hub: "Jeddah" },
  { name: "Turkish Airlines", hub: "Dubai" },
  { name: "Gulf Air", hub: "Dubai" },
  { name: "flydubai", hub: "Dubai" },
  { name: "Oman Air", hub: "Dubai" },
  { name: "Cathay Pacific", hub: "London" },
  { name: "British Airways", hub: "London" },
];

const DOMESTIC_ROUTES = [
  ["Karachi", "Islamabad"],
  ["Karachi", "Lahore"],
  ["Islamabad", "Karachi"],
  ["Lahore", "Islamabad"],
  ["Lahore", "Karachi"],
  ["Karachi", "Peshawar"],
];

const INTERNATIONAL_ROUTES = [
  ["Karachi", "Dubai"],
  ["Lahore", "Dubai"],
  ["Islamabad", "Dubai"],
  ["Karachi", "Jeddah"],
  ["Karachi", "Madinah"],
  ["Lahore", "London"],
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

  // Karachi is used as the default "from" for airline/hub shortcuts since it's
  // the busiest hub with the most route options for most of these carriers.
  const goToRoute = (fromCity, toCity) => {
    const from = CITY[fromCity];
    const to = CITY[toCity];
    if (!from || !to) return;
    const date = new Date();
    date.setDate(date.getDate() + 7); // default to a week out — always a valid future search
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
          <Column title="Domestic Airlines">
            <ul className="space-y-1.5 text-sm">
              {DOMESTIC_AIRLINES.map((a) => (
                <li key={a.name}>
                  <button
                    onClick={() => goToRoute("Karachi", a.hub === "Karachi" ? "Lahore" : a.hub)}
                    className="hover:text-jtCyan transition-colors text-left"
                  >
                    {a.name}
                  </button>
                </li>
              ))}
            </ul>
          </Column>
          <Column title="International Airlines">
            <ul className="space-y-1.5 text-sm">
              {INTERNATIONAL_AIRLINES.map((a) => (
                <li key={a.name}>
                  <button
                    onClick={() => goToRoute("Karachi", a.hub)}
                    className="hover:text-jtCyan transition-colors text-left"
                  >
                    {a.name}
                  </button>
                </li>
              ))}
            </ul>
          </Column>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Column title="Popular Domestic Routes">
            <ul className="space-y-1.5 text-sm">
              {DOMESTIC_ROUTES.map(([from, to]) => (
                <li key={`${from}-${to}`}>
                  <button onClick={() => goToRoute(from, to)} className="hover:text-jtCyan transition-colors text-left">
                    {from} → {to}
                  </button>
                </li>
              ))}
            </ul>
          </Column>
          <Column title="Popular International Routes">
            <ul className="space-y-1.5 text-sm">
              {INTERNATIONAL_ROUTES.map(([from, to]) => (
                <li key={`${from}-${to}`}>
                  <button onClick={() => goToRoute(from, to)} className="hover:text-jtCyan transition-colors text-left">
                    {from} → {to}
                  </button>
                </li>
              ))}
            </ul>
          </Column>
        </div>

        <Column title="We Accept">
          <p className="text-sm">JazzCash · EasyPaisa · Visa · Mastercard</p>
        </Column>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm border-t border-jtBorder pt-6">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.label} href={link.href} className="text-jtMuted hover:text-jtNavy cursor-pointer">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="pt-2">
          <Logo />
          <p className="text-jtMuted text-xs mt-3">© {year} Jahaz Ticket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
