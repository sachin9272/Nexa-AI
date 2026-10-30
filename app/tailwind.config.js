/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#004328',
          container: '#0D5C3A',
          fixed: '#A9F3C5',
          'fixed-dim': '#8ED6AA',
        },
        secondary: {
          DEFAULT: '#006C49',
          growth: '#10B981',
          container: '#6CF8BB',
          fixed: '#6FFBBE',
        },
        'on-secondary-container': '#00714D',
        whatsapp: {
          DEFAULT: '#29A71A',
          light: '#E8F5E9',
          dark: '#1E7E14',
        },
        ai: {
          purple: '#8B5CF6',
          'purple-light': '#F3E8FF',
          'purple-dark': '#7C3AED',
          cyan: '#00C4DF',
          'cyan-light': '#E0F7FA',
        },
        warning: {
          amber: '#F59E0B',
          'amber-light': '#FEF3C7',
        },
        surface: {
          DEFAULT: '#FAF8FF',
          bg: '#F8FAFC',
          subtle: '#F1F5F9',
          lowest: '#FFFFFF',
          low: '#F2F3FF',
          container: '#EAEDFF',
          high: '#E2E7FF',
        },
        'on-surface': '#131B2E',
        'on-surface-variant': '#404942',
        border: {
          subtle: '#E2E8F0',
          medium: '#CBD5E1',
        },
      },
    },
  },
  plugins: [],
};
