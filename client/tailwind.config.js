/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0D0B14', 2: '#0A0910' },
        surface: { DEFAULT: '#171420', 2: '#211D2E', 3: '#2B2540' },
        paper: { DEFAULT: '#F7F5FA', 2: '#EDE9F5' },
        current: { DEFAULT: '#7C5CFF', 2: '#9B80FF', dim: '#5B3FD9' },
        ember: { DEFAULT: '#FF7A45', 2: '#FF9466' },
        mist: { DEFAULT: '#A8A3B8', dark: '#5E5975' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(124,92,255,0.45)',
        emberglow: '0 0 30px -6px rgba(255,122,69,0.5)',
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      backdropBlur: { xs: '2px' },
      keyframes: {
        barpulse: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        shimmer: 'shimmer 1.6s linear infinite',
      },
      borderRadius: { '2xl': '1.25rem', '3xl': '1.75rem' },
    },
  },
  plugins: [],
}
