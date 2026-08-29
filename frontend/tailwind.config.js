/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#13141A',
        surface: '#1C1E27',
        'surface-low': '#181921',
        'surface-high': '#242B31',
        'surface-highest': '#2F3645',
        'surface-dim': '#13141A',

        primary: '#E8935A',
        'primary-hover': '#D4834E',
        'primary-muted': 'rgba(232,147,90,0.1)',
        'primary-border': 'rgba(232,147,90,0.3)',

        teal: '#4FB8A6',
        'teal-muted': 'rgba(79,184,166,0.1)',
        'teal-border': 'rgba(79,184,166,0.3)',

        'severity-low': '#4ADE80',
        'severity-review': '#FBBF24',
        'severity-high': '#FB923C',
        'severity-critical': '#F87171',
        'severity-insufficient': '#64748B',

        'on-surface': '#E8EAF0',
        'on-surface-dim': '#9CA3AF',
        'border-subtle': 'rgba(255,255,255,0.06)',
        'border-hover': 'rgba(255,255,255,0.12)',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        glass: '0 4px 20px rgba(0,0,0,0.3)',
        glow: '0 0 15px rgba(232,147,90,0.15)',
        'glow-lg': '0 0 25px rgba(232,147,90,0.25)',
        'glow-teal': '0 0 15px rgba(79,184,166,0.15)',
      },
    },
  },
  plugins: [],
}
