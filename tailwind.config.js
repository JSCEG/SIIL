/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}", "./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'gobmx-guinda': '#9B2247',
        'gobmx-verde': '#1E5B4F',
        'gobmx-dorado': '#A57F2C',
        'gobmx-gris': '#98989A',
        'gobmx-gris-claro': '#E5E5E5',
      },
      fontFamily: {
        headings: ['Patria', 'Merriweather', 'serif'],
        body: ['Noto Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
