import Logo from "./Logo";

const DOMESTIC_AIRLINES = [
  "Airblue",
  "Air Sial",
  "Pakistan International Airlines",
  "Serene Air",
  "Fly Jinnah",
];

const INTERNATIONAL_AIRLINES = [
  "Emirates",
  "Qatar Airways",
  "Etihad Airways",
  "Saudia",
  "Turkish Airlines",
  "Gulf Air",
  "flydubai",
  "Oman Air",
  "Cathay Pacific",
  "British Airways",
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
  "Home",
  "About Us",
  "Contact Us",
  "Manage Booking",
  "FAQ",
  "Privacy Policy",
  "Terms & Conditions",
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
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-jtBorder bg-white">
      <div className="px-4 py-8 space-y-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 gap-6">
          <Column title="Domestic Airlines">
            <ul className="space-y-1.5 text-sm">
              {DOMESTIC_AIRLINES.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </Column>
          <Column title="International Airlines">
            <ul className="space-y-1.5 text-sm">
              {INTERNATIONAL_AIRLINES.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </Column>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Column title="Popular Domestic Routes">
            <ul className="space-y-1.5 text-sm">
              {DOMESTIC_ROUTES.map(([from, to]) => (
                <li key={`${from}-${to}`}>
                  {from} → {to}
                </li>
              ))}
            </ul>
          </Column>
          <Column title="Popular International Routes">
            <ul className="space-y-1.5 text-sm">
              {INTERNATIONAL_ROUTES.map(([from, to]) => (
                <li key={`${from}-${to}`}>
                  {from} → {to}
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
            <span key={link} className="text-jtMuted hover:text-jtNavy cursor-pointer">
              {link}
            </span>
          ))}
        </div>

        <div className="pt-2">
          <Logo />
          <p className="text-jtMuted text-xs mt-3">
            © {year} Jahaz Ticket. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
