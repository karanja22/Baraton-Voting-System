/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // blue-600
          dark: '#1E3A8A'     // blue-800
        },
        success: '#22C55E',   // green-500
        error: '#EF4444',     // red-500
        warning: '#FBBF24',   // amber-400
        gray: {
          light: '#F3F4F6',   // gray-100
          soft: '#E5E7EB',    // gray-200
          dark: '#111827'     // gray-900
        }
      }
    },
  },
  plugins: [],
}