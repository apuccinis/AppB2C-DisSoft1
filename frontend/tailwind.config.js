/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta dark mode del prototipo (inspirada en plataformas financieras).
        base: {
          900: '#070A12',
          800: '#0B0F1A',
          700: '#111725',
          600: '#161E2F',
          500: '#1E293B',
        },
        accent: {
          DEFAULT: '#4F7DFB',
          soft: '#7A9CFF',
        },
        bull: '#10B981',
        bear: '#F43F5E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 32px -16px rgba(0,0,0,0.8)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 220ms ease-out',
      },
    },
  },
  plugins: [],
};
