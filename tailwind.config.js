/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Kanit', 'sans-serif'],
      },
      // Keep these in sync with src/lib/theme.ts's COLORS — duplicated
      // rather than imported because this file is loaded directly by
      // Node/PostCSS, not through Vite's TS transform pipeline.
      colors: {
        ink: '#0C0C0C',
        mist: '#D7E2EA',
        paper: '#FFFFFF',
        accent: {
          deep: '#18011F',
          magenta: '#B600A8',
          violet: '#7621B0',
          ember: '#BE4C00',
        },
      },
    },
  },
  plugins: [],
};
