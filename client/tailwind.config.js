/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070b12",
        panel: "#0d1420",
        panel2: "#111b2a",
        line: "#223247",
        steel: "#8fa3bb",
        copper: "#d1844b",
        ore: "#cbd5e1",
        mint: "#4ade80",
        amber: "#f6c85f",
        danger: "#fb7185"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(0,0,0,0.32)"
      }
    },
  },
  plugins: [],
};
