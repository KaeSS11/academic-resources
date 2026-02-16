import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Muted dark colors for icon containers (used for borders)
        'muted-blue': '#2B4A75',
        'muted-green': '#2B5C3D',
        'muted-purple': '#5B3A6B',
        'muted-red': '#6B2E2E',
        'muted-orange': '#7A602B',
        // Lighter, more transparent versions for backgrounds
        'muted-blue-light': '#4A6B95',
        'muted-green-light': '#4A7D5D',
        'muted-purple-light': '#7B5A8B',
        'muted-red-light': '#8B4E4E',
        'muted-orange-light': '#9A803B',
        // Bright icon colors
        'icon-blue': '#3B82F6',
        'icon-green': '#10B981',
        'icon-purple': '#A855F7',
        'icon-red': '#EF4444',
        'icon-orange': '#F59E0B',
      },
    },
  },
  plugins: [],
};
export default config;
