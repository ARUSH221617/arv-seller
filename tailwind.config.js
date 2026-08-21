/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx,html}',
    './templates/**/*.php',
    './admin/**/*.php',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1380px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        // Sorkhab Brand Palette (Light Mode Optimized)
        arvan: {
          teal: '#008b8b',
          'teal-light': '#00a3a3',
          'teal-dark': '#006d6d',
          'teal-glow': 'rgba(0, 139, 139, 0.20)',
          pink: '#e11d48',
          amber: '#d97706',
          emerald: '#059669',
          rose: '#dc2626',
          blue: '#2563eb',
        },

        // Material Design 3 (M3) Surface Elevation Levels for Light Theme
        m3: {
          surface: '#f8fafc',
          'surface-1': '#ffffff',
          'surface-2': '#f1f5f9',
          'surface-3': '#ffffff',
          'surface-4': '#e2e8f0',
          'surface-5': '#cbd5e1',
          'surface-variant': '#f1f5f9',
          'on-surface': '#0f172a',
          'on-surface-variant': '#64748b',
          outline: 'rgba(0, 0, 0, 0.08)',
          'outline-variant': 'rgba(0, 0, 0, 0.04)',
          primary: '#008b8b',
          'on-primary': '#ffffff',
          'primary-container': '#e6f7f7',
          'on-primary-container': '#004f50',
          secondary: '#e11d48',
          'secondary-container': '#fdf2f8',
          'on-secondary-container': '#831843',
        },

        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      fontFamily: {
        persian: ['Vazirmatn', 'Tahoma', 'sans-serif'],
        latin: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'sans-serif'],
        chinese: ['PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', 'sans-serif'],
        russian: ['Plus Jakarta Sans', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2.5s infinite ease-in-out',
      },
    },
  },
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('tailwindcss-animate'),
  ],
};
