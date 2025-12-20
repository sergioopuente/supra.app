
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Text"',
          '"SF Pro Display"',
          'Inter',
          'system-ui',
          'sans-serif',
        ],
        serif: ['"Playfair Display"', 'serif'],
      },
      letterSpacing: {
        tighter: '-0.022em', // SF Pro Display Large
        tight: '-0.011em',   // SF Pro Headline
        normal: '0',         // SF Pro Body
        wide: '0.01em',      // SF Pro Caption
      },
      fontWeight: {
        medium: '500',
        semibold: '600',
      },
      colors: {
        black: '#000000',
        neutral: {
          900: '#1C1C1E', // Elevación Apple Dark
          800: '#2C2C2E',
          700: '#3A3A3C',
        }
      }
    },
  },
  plugins: [],
}
