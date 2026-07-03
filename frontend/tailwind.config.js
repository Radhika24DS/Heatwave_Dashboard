/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#9d4300",
        "primary-container": "#f97316",
        "on-primary": "#ffffff",
        "surface-variant": "#f5ded5",
        "on-surface": "#201a17",
        "surface": "#fffbff",
        "error": "#ba1a1a",
        heatwave: {
          normal:  '#16a34a',
          watch:   '#ca8a04',
          warning: '#ea580c',
          extreme: '#dc2626',
        }
      },
      borderRadius: {
        full: "0.75rem",
        card: "1rem",
        chip: "0.5rem",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        'heat-glow': '0 4px 24px rgba(249,115,22,0.18)',
        'heat-glow-lg': '0 8px 40px rgba(249,115,22,0.25)',
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':     'fadeIn 0.4s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
