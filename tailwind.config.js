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
        brand: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#333333',
          600: '#1a1a1a',
          700: '#0f0f0f',
          800: '#080808',
          900: '#000000',
        },
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      boxShadow: {
        'soft-sm': '0 2px 4px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)',
        'soft': '0 4px 6px rgba(0,0,0,0.02), 0 1px 3px rgba(0,0,0,0.03)',
        'soft-md': '0 6px 8px rgba(0,0,0,0.02), 0 2px 4px rgba(0,0,0,0.03)',
        'soft-lg': '0 8px 12px rgba(0,0,0,0.02), 0 3px 6px rgba(0,0,0,0.03)',
      },
    },
  },
  plugins: [],
} 