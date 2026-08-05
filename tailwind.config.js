/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        jtNavy: "#0B2545",      // Deep Royal Blue — Headers, Logo, Trust
        jtNavyDark: "#06182E",  // Darker shade for hover states
        
        // Accent / Flight Energy
        jtCyan: "#00A8E8",      // Aero Cyan — Wings, Icons, Flight vibes
        jtCyanLight: "#33BCED", // Light cyan for gradients
        
        // Action / Booking CTA
        jtOrange: "#FF6B35",    // Sunset Orange — Book Now, Search
        jtOrangeDark: "#E55A2B",// Darker orange for hover
        
        // Backgrounds
        jtWhite: "#F8FAFC",     // Soft Sky White — Main body bg
        jtCard: "#FFFFFF",      // Pure white cards
        jtBorder: "#E2E8F0",    // Subtle borders
        
        // Text
        jtText: "#1E293B",      // Dark slate for body text
        jtMuted: "#64748B",     // Muted text for hints/labels
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      fontFamily: {
        sans: ['Inter', 'Montserrat', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
