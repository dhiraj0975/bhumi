// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-border': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
};
