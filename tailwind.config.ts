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
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        lisso: '0 8px 24px -4px rgba(30, 20, 10, 0.08), 0 2px 8px -1px rgba(30, 20, 10, 0.05)',
        'lisso-hover': '0 16px 36px -6px rgba(30, 20, 10, 0.12), 0 4px 14px -2px rgba(30, 20, 10, 0.06)',
        'lisso-card': '0 10px 30px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
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
