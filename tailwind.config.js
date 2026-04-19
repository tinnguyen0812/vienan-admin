/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
      },
      colors: {
        brand: {
          black:  '#000000',
          white:  '#FFFFFF',
          gray:   '#F3F4F6',
          // Subtle accents
          muted:  '#6B7280',
          border: '#E5E7EB',
          // Status palette
          pending:   '#F59E0B',
          shipping:  '#3B82F6',
          delivered: '#10B981',
          cancelled: '#EF4444',
        },
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.10)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
