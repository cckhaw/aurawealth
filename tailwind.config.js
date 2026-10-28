/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        apple: {
          blue: '#007AFF',
          green: '#30D158',
          orange: '#FF9500',
          red: '#FF3B30',
          indigo: '#5856D6',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"',
          'Inter', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif',
        ],
      },
      borderRadius: { card: '24px', ctl: '14px' },
      boxShadow: { soft: '0 10px 30px rgba(0, 0, 0, 0.05)' },
      transitionTimingFunction: { apple: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    },
  },
  plugins: [],
}
