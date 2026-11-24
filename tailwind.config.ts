import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: {
          50: '#FAF7F2',
          100: '#F5EFE6',
          200: '#EFEAE0',
          300: '#E4DC CE',
          400: '#D5C9B7',
          500: '#BAA993',
          DEFAULT: '#F4EFE6',
        },
        doff: {
          50: '#F4F5F6',
          100: '#E5E7EB',
          200: '#D1D5DB',
          300: '#9CA3AF',
          400: '#6B7280',
          500: '#4B5563',
          600: '#374151',
          700: '#2A2C32',
          800: '#22242A',
          900: '#1A1C20',
          950: '#141518',
          card: '#25282F',
          DEFAULT: '#1A1C20',
        },
        ink: '#1E2024',
        glass: 'rgba(255, 255, 255, 0.10)',
        'glass-line': 'rgba(255, 255, 255, 0.16)',
      },
      boxShadow: {
        lisso: '0 4px 25px -4px rgba(0, 0, 0, 0.04), 0 2px 10px -2px rgba(0, 0, 0, 0.02)',
        'lisso-hover': '0 12px 32px -4px rgba(0, 0, 0, 0.07), 0 4px 14px -2px rgba(0, 0, 0, 0.03)',
        glass: '0 18px 50px rgba(4, 10, 28, 0.26)',
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
    },
  },
  plugins: [],
} satisfies Config
