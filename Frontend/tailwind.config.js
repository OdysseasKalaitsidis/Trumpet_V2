/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'liquid-bg': '#202020',
        'liquid-primary': '#4a90e2',
        'liquid-accent': '#6c5ce7',
        'theme-text': 'var(--color-text)',
        'theme-text-muted': 'var(--color-text-muted)',
        'theme-text-light': 'var(--color-text-light)',
        'theme-bg': 'var(--color-bg)',
        'theme-bg-warm': 'var(--color-bg-warm)',
        'theme-bg-muted': 'var(--color-bg-muted)',
        'theme-border': 'var(--color-border)',
        'theme-surface': 'var(--color-surface)',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        'liquid': '20px',
      },
      transitionTimingFunction: {
        'liquid': 'cubic-bezier(0.165, 0.84, 0.44, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      }
    },
  },
  plugins: [],
}
