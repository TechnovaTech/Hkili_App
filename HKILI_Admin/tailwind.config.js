/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#050D15', // Darker background
          900: '#0A1929', // App background color
          800: '#121212',
          700: '#1a1a1a',
          600: '#2a2a2a',
        },
        primary: {
          DEFAULT: '#4CAF50',
          dark: '#2E7D32',
        },
        secondary: '#2196F3',
      },
    },
  },
  plugins: [],
}