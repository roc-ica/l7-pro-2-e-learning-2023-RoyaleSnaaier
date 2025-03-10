/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rarity: {
          common: '#8e8e8e',
          rare: '#4287f5',
          epic: '#9c27b0',
          legendary: '#ffd700',
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
