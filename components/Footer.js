import Link from "next/link";
import { useRouter } from "next/router";
import Logo from "./Logo";

// Real IATA codes across every continent — every click here runs a real,
// working search (Karachi is used as the default "from" so a single click
// on a destination or airline is enough to see live results).
const CITY = {
  Karachi: { code: "KHI", label: "Karachi (KHI)" },
  Lahore: { code: "LHE", label: "Lahore (LHE)" },
  Islamabad: { code: "ISB", label: "Islamabad (ISB)" },

  // Middle East & Asia-Pacific
  Dubai: { code: "DXB", label: "Dubai (DXB)" },
  Jeddah: { code: "JED", label: "Jeddah (JED)" },
  Riyadh: { code: "RUH", label: "Riyadh (RUH)" },
  Doha: { code: "DOH", label: "Doha (DOH)" },
  Bangkok: { code: "BKK", label: "Bangkok (BKK)" },
  Singapore: { code: "SIN", label: "Singapore (SIN)" },
  "Kuala Lumpur": { code: "KUL", label: "Kuala Lumpur (KUL)" },
  Tokyo: { code: "NRT", label: "Tokyo (NRT)" },
  "Hong Kong": { code: "HKG", label: "Hong Kong (HKG)" },
  Mumbai: { code: "BOM", label: "Mumbai (BOM)" },
  Istanbul: { code: "IST", label: "Istanbul (IST)" },
  Sydney: { code: "SYD", label: "Sydney (SYD)" },

  // Europe
  London: { code: "LON", label: "London — All airports" },
  Paris: { code: "CDG", label: "Paris (CDG)" },
  Frankfurt: { code: "FRA", label: "Frankfurt (FRA)" },
  Amsterdam: { code: "AMS", label: "Amsterdam (AMS)" },
  Rome: { code: "FCO", label: "Rome (FCO)" },
  Madrid: { code: "MAD", label: "Madrid (MAD)" },
  Zurich: { code: "ZRH", label: "Zurich (ZRH)" },

  // Americas
  "New York": { code: "NYC", label: "New York — All airports" },
  Toronto: { code: "YYZ", label: "Toronto (YYZ)" },
  Vancouver: { code: "YVR", label: "Vancouver (YVR)" },
  "Los Angeles": { code: "LAX", label: "Los Angeles (LAX)" },
  Chicago: { code: "ORD", label: "Chicago (ORD)" },
  Miami: { code: "MIA", label: "Miami (MIA)" },

  // Africa & Oceania
  Cairo: { code: "CAI", label: "Cairo (CAI)" },
  Johannesburg: { code: "JNB", label: "Johannesburg (JNB)" },
  Nairobi: { code: "NBO", label: "Nairobi (NBO)" },
  "Cape Town": { code: "CPT", label: "Cape Town (CPT)" },
  Melbourne: { code: "MEL", label: "Melbourne (MEL)" },
};

const DESTINATIONS = {
  "Middle East & Asia": ["Dubai", "Jeddah", "Riyadh", "Doha", "Bangkok", "Singapore", "Kuala Lumpur", "Tokyo", "Hong Kong", "Mumbai", "Istanbul"],
  "Europe": ["London", "Paris", "Frankfurt", "Amsterdam", "Rome", "Madrid", "Zurich"],
  "Americas": ["New York", "Toronto", "Vancouver", "Los Angeles", "Chicago", "Miami"],
  "Africa & Oceania": ["Cairo", "Johannesburg", "Nairobi", "Cape Town", "Sydney", "Melbourne"],
};

const AIRLINES = [
  { name: "Emirates", hub: "Dubai" },
  { name: "Qatar Airways", hub: "Doha" },
  { name: "Etihad Airways", hub: "Dubai" },
  { name: "Saudia", hub: "Jeddah" },
  { name: "Gulf Air", hub: "Dubai" },
  { name: "flydubai", hub: "Dubai" },
  { name: "Air Arabia", hub: "Dubai" },
  { name: "Oman Air", hub: "Dubai" },
  { name: "Pakistan International Airlines", hub: "Karachi" },
  { name: "Airblue", hub: "Lahore" },
  { name: "Serene Air", hub: "Islamabad" },
  { name: "Fly Jinnah", hub: "Karachi" },
  { name: "Singapore Airlines", hub: "Singapore" },
  { name: "Cathay Pacific", hub: "Hong Kong" },
  { name: "Thai Airways", hub: "Bangkok" },
  { name: "Malaysia Airlines", hub: "Kuala Lumpur" },
  { name: "Japan Airlines", hub: "Tokyo" },
  { name: "Turkish Airlines", hub: "Istanbul" },
  { name: "British Airways", hub: "London" },
  { name: "Lufthansa", hub: "Frankfurt" },
  { name: "Air France", hub: "Paris" },
  { name: "KLM", hub: "Amsterdam" },
  { name: "Swiss International", hub: "Zurich" },
  { name: "American Airlines", hub: "New York" },
  { name: "United Airlines", hub: "Chicago" },
  { name: "Air Canada", hub: "Toronto" },
  { name: "Ethiopian Airlines", hub: "Cairo" },
  { name: "EgyptAir", hub: "Cairo" },
  { name: "Kenya Airways", hub: "Nairobi" },
  { name: "Qantas", hub: "Sydney" },
];

const POPULAR_ROUTES = [
  ["Karachi", "Dubai"],
  ["Lahore", "London"],
  ["Islamabad", "Istanbul"],
  ["London", "New York"],
  ["Dubai", "Singapore"],
  ["Singapore", "Tokyo"],
  ["Paris", "Dubai"],
  ["Toronto", "London"],
  ["Los Angeles", "Tokyo"],
  ["Cairo", "London"],
  ["Sydney", "Singapore"],
  ["Nairobi", "Dubai"],
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

const linkClass =
  "text-jtCyan underline decoration-jtCyan/40 underline-offset-2 hover:decoration-jtCyan transition-colors text-left";

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
        <div>
          <p className="text-jtMuted text-xs uppercase tracking-wide mb-3">Destinations Worldwide</p>
          <div className="grid grid-cols-2 gap-6">
            {Object.entries(DESTINATIONS).map(([region, cities]) => (
              <Column key={region} title={region}>
                <ul className="space-y-1.5 text-sm">
                  {cities.map((city) => (
                    <li key={city}>
                      <button onClick={() => goToRoute("Karachi", city)} className={linkClass}>
                        {city}
                      </button>
                    </li>
                  ))}
                </ul>
              </Column>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Column title="Airlines We Search">
            <ul className="space-y-1.5 text-sm">
              {AIRLINES.slice(0, 15).map((a) => (
                <li key={a.name}>
                  <button onClick={() => goToRoute("Karachi", a.hub)} className={linkClass}>
                    {a.name}
                  </button>
                </li>
              ))}
            </ul>
          </Column>
          <Column title="More Airlines">
            <ul className="space-y-1.5 text-sm">
              {AIRLINES.slice(15).map((a) => (
                <li key={a.name}>
                  <button onClick={() => goToRoute("Karachi", a.hub)} className={linkClass}>
                    {a.name}
                  </button>
                </li>
              ))}
            </ul>
          </Column>
        </div>

        <Column title="Popular Routes Worldwide">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {POPULAR_ROUTES.map(([from, to]) => (
              <button key={`${from}-${to}`} onClick={() => goToRoute(from, to)} className={linkClass}>
                {from} → {to}
              </button>
            ))}
          </div>
        </Column>

        <Column title="We Accept">
          <p className="text-sm">Visa · Mastercard · Google Pay · International Payments</p>
        </Column>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm border-t border-jtBorder pt-6">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.label} href={link.href} className={linkClass}>
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
