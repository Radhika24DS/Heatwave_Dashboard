/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"Outfit"', '"Inter"', 'system-ui', 'sans-serif'],
        heading: ['"Outfit"', 'system-ui', 'sans-serif'],
        mono:    ['"Fira Code"', 'monospace'],
      },
      colors: {
        brand: {
          // Dark backgrounds
          bg:      '#0d0d0d',
          surface: '#141414',
          card:    '#1a1a1a',
          navy:    '#111827',   // dark blue-grey used in dashboard panels
          slate:   '#1f2937',   // medium blue-grey for inputs/cards
          border:  '#2a2a2a',
          // Text
          text:    '#f5f0eb',
          muted:   '#a8a29e',
          faint:   '#57534e',
          // Accent gradient (sunset → solar)
          primary: '#ff6b35',
          mid:     '#ff9500',
          yellow:  '#ffd500',
          // Highlight / interactive
          glow:    'rgba(255,107,53,0.35)',
        },
        risk: {
          low:      '#4ade80',   // bright green
          moderate: '#facc15',   // solar yellow
          high:     '#fb923c',   // deep orange
          extreme:  '#ef4444',   // alert red
          // Soft backgrounds for badges
          lowBg:      'rgba(74,222,128,0.12)',
          moderateBg: 'rgba(250,204,21,0.12)',
          highBg:     'rgba(251,146,60,0.12)',
          extremeBg:  'rgba(239,68,68,0.12)',
        },
      },
      backgroundImage: {
        'heat-gradient': 'linear-gradient(135deg, #ff6b35 0%, #ff9500 50%, #ffd500 100%)',
        'heat-dark':     'linear-gradient(180deg, #1a0800 0%, #0d0d0d 100%)',
        'heat-radial':   'radial-gradient(ellipse at center, #2d0f00 0%, #0d0d0d 70%)',
        'card-glow':     'radial-gradient(ellipse at top left, rgba(255,107,53,0.08) 0%, transparent 60%)',
        'sidebar-grad':  'linear-gradient(180deg, #141414 0%, #0d0d0d 100%)',
        'auth-bg':       'radial-gradient(ellipse at 20% 50%, rgba(255,107,53,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255,213,0,0.08) 0%, transparent 50%)',
      },
      boxShadow: {
        heat:         '0 0 30px rgba(255,107,53,0.25)',
        'heat-lg':    '0 0 60px rgba(255,107,53,0.3)',
        card:         '0 4px 24px rgba(0,0,0,0.5)',
        glow:         '0 0 20px rgba(255,107,53,0.4)',
        'inner-heat': 'inset 0 1px 0 rgba(255,149,0,0.15)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,107,53,0.15)',
      },
      animation: {
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in':     'fadeIn 0.4s ease-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'heat-glow':   'heatGlow 2s ease-in-out infinite alternate',
        'float':       'float 6s ease-in-out infinite',
        'spin-slow':   'spin 8s linear infinite',
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
        heatGlow: {
          '0%':   { boxShadow: '0 0 10px rgba(255,107,53,0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(255,107,53,0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
