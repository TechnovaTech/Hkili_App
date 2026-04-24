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
          900: '#0a0a0a',
          800: '#121212',
          700: '#1a1a1a',
          600: '#2a2a2a',
        },
        app: {
          bg: '#0A1929',
          surface: '#1E3A8A',
          surfaceVariant: '#1565C0',
          primary: '#4CAF50',
          primaryDark: '#2E7D32',
          accent: '#00E676',
          border: '#1976D2',
          textSecondary: '#81C784',
          textMuted: '#64B5F6',
        },
      },
    },
  },
  plugins: [],
}