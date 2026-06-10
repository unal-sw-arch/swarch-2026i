import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // -----------------------------------------------------------------------
      // Digital Sanctuary — warm espresso palette
      // -----------------------------------------------------------------------
      colors: {
        background: '#140c0c',

        surface: {
          DEFAULT: '#1c1312',
          dim: '#140c0c',
          bright: '#2e2220',
          tint: '#ff9a5d',
          variant: '#3d2e2c',
          container: {
            DEFAULT: '#221816',
            low: '#1c1312',
            lowest: '#0e0807',
            high: '#2e2220',
            highest: '#3d2e2c',
          },
        },

        // Sunset orange — primary CTA / accent
        primary: {
          DEFAULT: '#ffdcc8',
          container: '#ff9a5d',
          fixed: '#ffb47a',
          'fixed-dim': '#ff9a5d',
          on: '#1c0800',
          'on-container': '#6b1e00',
          'on-fixed': '#0f0300',
          'on-fixed-variant': '#561400',
          dim: '#f9873e',
        },

        // Soft lavender — secondary
        secondary: {
          DEFAULT: '#d4c0e8',
          container: '#9b7ec8',
          fixed: '#e2d4f5',
          'fixed-dim': '#b49bd6',
          on: '#1e1230',
          'on-container': '#2c1c48',
          dim: '#7b5ea7',
        },

        // Mint — success / positive states
        tertiary: {
          DEFAULT: '#a8dfc7',
          container: '#5db896',
          fixed: '#c4ecd9',
          'fixed-dim': '#7ecfb1',
          on: '#00231a',
          'on-container': '#003d29',
        },

        on: {
          surface: '#f0dbd9',
          'surface-variant': '#c4a8a5',
          background: '#f0dbd9',
          error: '#690005',
          'error-container': '#ffdad6',
        },

        outline: {
          DEFAULT: '#7a5e5c',
          variant: '#4a3432',
        },

        error: {
          DEFAULT: '#fe7453',
          container: '#7a0019',
        },
      },

      // -----------------------------------------------------------------------
      // Typography — Lexend (headlines) + Be Vietnam Pro (body)
      // -----------------------------------------------------------------------
      fontFamily: {
        headline: ['var(--font-lexend)', 'Lexend', 'sans-serif'],
        body: ['var(--font-be-vietnam-pro)', 'Be Vietnam Pro', 'sans-serif'],
        sans: ['var(--font-be-vietnam-pro)', 'Be Vietnam Pro', 'sans-serif'],
      },

      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.75rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },

      // -----------------------------------------------------------------------
      // Radii — sanctuary rule: nothing sharp
      // -----------------------------------------------------------------------
      borderRadius: {
        sm: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        full: '9999px',
      },

      // -----------------------------------------------------------------------
      // Shadows — warm amber ambient, no harsh black
      // -----------------------------------------------------------------------
      boxShadow: {
        'glow-primary': '0 0 20px rgba(255, 154, 93, 0.25)',
        'glow-primary-lg': '0 0 40px rgba(255, 154, 93, 0.40)',
        'glow-secondary': '0 0 20px rgba(155, 126, 200, 0.20)',
        'glow-tertiary': '0 0 20px rgba(93, 184, 150, 0.20)',
        ambient: '0 8px 40px rgba(249, 224, 223, 0.05)',
        'ambient-lg': '0 16px 60px rgba(249, 224, 223, 0.08)',
        'card-hover': '0 12px 40px rgba(255, 154, 93, 0.12)',
      },

      // -----------------------------------------------------------------------
      // Spacing extras
      // -----------------------------------------------------------------------
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },

      // -----------------------------------------------------------------------
      // Gradients
      // -----------------------------------------------------------------------
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'sunset': 'linear-gradient(135deg, #ff9a5d 0%, #f9873e 100%)',
        'sunset-glow': 'radial-gradient(ellipse at center, rgba(255, 154, 93, 0.15) 0%, transparent 70%)',
        'sanctuary-depth': 'radial-gradient(ellipse at 50% 0%, rgba(155, 126, 200, 0.08) 0%, transparent 60%)',
      },

      // -----------------------------------------------------------------------
      // Keyframes — atmospheric, no tactical elements
      // -----------------------------------------------------------------------
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'ambient-float': {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px, 15px) scale(0.97)' },
        },
        'ambient-float-alt': {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(-25px, 20px) scale(1.03)' },
          '66%': { transform: 'translate(20px, -15px) scale(0.98)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-warm': {
          '0%, 100%': { boxShadow: '0 0 8px rgba(255, 154, 93, 0.15)' },
          '50%': { boxShadow: '0 0 25px rgba(255, 154, 93, 0.35)' },
        },
      },

      animation: {
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'ambient-float': 'ambient-float 18s ease-in-out infinite',
        'ambient-float-alt': 'ambient-float-alt 22s ease-in-out infinite',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-warm': 'pulse-warm 2.5s ease-in-out infinite',
      },
    },
  },
  plugins: [typography],
};

export default config;
