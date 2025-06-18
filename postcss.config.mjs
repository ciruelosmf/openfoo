// postcss.config.js
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // OLD WAY (likely causing the error):
    // tailwindcss: {},

    // NEW WAY (as per the error message):
    '@tailwindcss/postcss': {}, // Use the specific package

    autoprefixer: {},
  },
};

export default config;