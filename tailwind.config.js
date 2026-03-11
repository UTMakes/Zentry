/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: { 
        sans: ['Inter', 'sans-serif'],
        'zentry-logo': ['Share', 'Inter', 'sans-serif'] 
      },
      colors: { 
        zentry: { 
          dark: '#0f172a', 
          card: '#1e293b', 
          accent: '#3b82f6', 
          hover: '#2563eb' 
        } 
      },
      animation: { 
        'bounce-slow': 'bounce 3s infinite', 
        'spin-fast': 'spin 0.5s linear 1' 
      },
    },
  },
  plugins: [],
}
