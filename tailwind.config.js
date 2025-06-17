// tailwind.config.js
module.exports = {
  darkMode: "class",
  content: [
    './app/**/*.{js,ts,jsx,tsx}', // Ensure this includes all relevant paths
    './components/**/*.{js,ts,jsx,tsx}', // If you have a components directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
