module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        fon: {
          primary: '#1B3A6B',
          accent: '#4ECBA0',
          hover: '#2D5A9E',
          bg: '#F0F4F8',
          card: '#FFFFFF',
          text: '#1B3A6B',
          muted: '#64748B',
          danger: '#EF4444',
          warning: '#F59E0B',
          success: '#10B981',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(27, 58, 107, 0.08)',
        'hover': '0 8px 32px rgba(27, 58, 107, 0.16)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}