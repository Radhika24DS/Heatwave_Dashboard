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
          bg:      '#0a0e1a',   // Deep space cadet navy-black
          surface: '#101726',   // Main panel wrappers & nav headers (dark slate blue)
          card:    '#162032',   // Bounded card & grid panels (medium navy-slate)
          navy:    '#111827',   // dark blue-grey used in dashboard panels
          slate:   '#1f2937',   // medium blue-grey for inputs/cards
          border:  '#1e293b',   // Subtle divider lines (slate gray)
          // Text
          text:    '#f5f0eb',
          muted:   '#a8a29e',
          faint:   '#57534e',
          // Accent gradient (sunset → solar)
          primary: '#ff4500',   // warm orange-red (sunset heat indicator)
          mid:     '#ff8c00',   // solar amber
          yellow:  '#ffd700',   // golden yellow
          // Highlight / interactive
          glow:    'rgba(255,69,0,0.35)',
        },
        risk: {
          low:      '#10b981',   // bright emerald green
          moderate: '#f59e0b',   // solar yellow-amber
          high:     '#ef4444',   // alert crimson red
          extreme:  '#dc2626',   // alert deep fire engine red
          // Soft backgrounds for badges
          lowBg:      'rgba(16,185,129,0.12)',
          moderateBg: 'rgba(245,158,11,0.12)',
          highBg:     'rgba(239,68,68,0.12)',
          extremeBg:  'rgba(220,38,38,0.12)',
        },
      },
      backgroundImage: {
        'heat-gradient': 'linear-gradient(135deg, #ff4500 0%, #ff8c00 50%, #ffd700 100%)',
        'heat-dark':     'linear-gradient(180deg, #160a04 0%, #0a0e1a 100%)',
        'heat-radial':   'radial-gradient(ellipse at center, #230b00 0%, #0a0e1a 70%)',
        'card-glow':     'radial-gradient(ellipse at top left, rgba(255,69,0,0.08) 0%, transparent 60%)',
        'sidebar-grad':  'linear-gradient(180deg, #101726 0%, #0a0e1a 100%)',
        'auth-bg':       'radial-gradient(ellipse at 20% 50%, rgba(255,69,0,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255,215,0,0.08) 0%, transparent 50%)',
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
