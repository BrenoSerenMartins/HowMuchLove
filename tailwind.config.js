/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./auth/**/*.{js,ts,jsx,tsx}",
    "./customer/**/*.{js,ts,jsx,tsx}",
    "./marketing/**/*.{js,ts,jsx,tsx}",
    "./shared/**/*.{js,ts,jsx,tsx}",
    "./story/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      maxWidth: {
        'fluid': 'clamp(80rem, 90vw, 120rem)',
      },
      spacing: {
        'fluid-gap': 'clamp(2rem, 5vw, 4rem)',
        'fluid-py': 'clamp(4rem, 12vh, 8rem)',
      },
      fontSize: {
        'fluid-h1': 'clamp(2.5rem, 9vw, 9rem)',
        'fluid-h2': 'clamp(2rem, 6vw, 5rem)',
        'fluid-body': 'clamp(0.875rem, 1.2vw, 1.25rem)',
      },
      colors: {
        primary: '#ff2d55',
        'primary-hover': '#e6244b',
        'magic-purple': '#7c3aed',
        'deep-black': '#050505',
        'surface-black': '#0a0a0a',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Poppins', 'sans-serif'],
        cursive: ['"Dancing Script"', 'cursive'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'glow-pulse': 'glowPulse 3s infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)', filter: 'blur(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        glowPulse: {
          '0%': { opacity: '0.4', filter: 'blur(10px)' },
          '100%': { opacity: '0.8', filter: 'blur(20px)' },
        },
      },
      boxShadow: {
        'elite': '0 20px 50px rgba(0, 0, 0, 0.5)',
        'glow-primary': '0 0 20px rgba(255, 45, 85, 0.3)',
      },
    },
  },
  plugins: [],
}
