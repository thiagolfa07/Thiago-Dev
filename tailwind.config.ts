import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#08070D",
        panel: "#11101A",
        violet: { 300: "#C4B5FD", 400: "#A78BFA", 500: "#8B5CF6", 600: "#7C3AED" }
      },
      boxShadow: { neon: "0 0 35px rgba(139, 92, 246, .18)" }
    }
  },
  plugins: [],
};
export default config;
