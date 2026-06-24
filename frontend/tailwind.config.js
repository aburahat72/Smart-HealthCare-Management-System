/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#0056D2',
          600: '#0047B3',
          700: '#003D99',
        },
        navy: '#0A192F',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.06)',
        soft: '0 2px 12px rgba(0, 86, 210, 0.08)',
      },
    },
  },
  plugins: [],
};
