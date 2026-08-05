/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        jtNavy: "#0B2545",
        jtNavyDark: "#06182E",
        jtCyan: "#00A8E8",
        jtCyanLight: "#33BCED",
        jtOrange: "#FF6B35",
        jtOrangeDark: "#E55A2B",
        jtWhite: "#F8FAFC",
        jtCard: "#FFFFFF",
        jtBorder: "#E2E8F0",
        jtText: "#1E293B",
        jtMuted: "#64748B",
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
