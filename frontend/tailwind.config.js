/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0b0f19', // Very dark slate
          navy: '#111827', // Deep navy (gray-900)
          slate: '#1f2937', // Slate (gray-800)
          card: '#1f2937', // Card bg
          border: '#374151', // Border (gray-700)
          text: '#f9fafb', // Light gray (gray-50)
          muted: '#9ca3af', // Muted gray (gray-400)
        },
        risk: {
          low: '#10b981',      // Emerald 500 (Green)
          moderate: '#eab308', // Yellow 500 (Yellow)
          high: '#f97316',     // Orange 500 (Orange)
          extreme: '#ef4444',  // Red 500 (Red)
        }
      }
    },
  },
  plugins: [],
}
