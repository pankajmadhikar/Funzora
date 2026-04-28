/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
          soft: 'var(--color-primary-soft)',
        },
        ui: {
          muted: 'var(--color-ui-bg-muted)',
          border: 'var(--color-ui-border)',
          heading: 'var(--color-ui-heading)',
          body: 'var(--color-ui-body)',
        },
      },
    },
  },
  plugins: [],
};
