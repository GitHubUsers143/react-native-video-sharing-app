/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#161622',
        secondary: {
          // DEFAULT: "#FF9C01",
          // 100: "#FF9001",
          // 200: "#FF8E01",
          DEFAULT: '#FF4C4C', // a vivid red
          100: '#FF3A3A', // slightly darker red
          200: '#FF2E2E', // even deeper red
        },
        black: {
          DEFAULT: '#000',
          100: '#1E1E2D',
          200: '#232533',
        },
        gray: {
          100: '#CDCDE0',
        },
      },
      fontFamily: {
        pthin: ['Poppins-Thin', 'sans-serif'],
        pextralight: ['Poppins-ExtraLight', 'sans-serif'],
        plight: ['Poppins-Light', 'sans-serif'],
        pregular: ['Poppins-Regular', 'sans-serif'],
        pmedium: ['Poppins-Medium', 'sans-serif'],
        psemibold: ['Poppins-SemiBold', 'sans-serif'],
        pbold: ['Poppins-Bold', 'sans-serif'],
        pextrabold: ['Poppins-ExtraBold', 'sans-serif'],
        pblack: ['Poppins-Black', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
