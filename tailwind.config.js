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
        border: 'var(--arvan-border, hsl(var(--border)))',
        input: 'var(--arvan-border, hsl(var(--input)))',
        ring: 'var(--arvan-primary, hsl(var(--ring)))',
        background: 'var(--arvan-bg, hsl(var(--background)))',
        foreground: 'var(--arvan-text, hsl(var(--foreground)))',
        
        // Dynamic Arvan Brand Palette with CSS variable bindings
        arvan: {
          teal: 'var(--arvan-teal, var(--arvan-primary, #008b8b))',
          'teal-light': 'var(--arvan-primary-light, #00a3a3)',
          'teal-dark': 'var(--arvan-teal-dark, var(--arvan-secondary, #006d6d))',
          'teal-glow': 'var(--arvan-primary-glow, rgba(0, 139, 139, 0.20))',
          pink: '#e11d48',
          amber: '#d97706',
          emerald: '#059669',
          rose: '#dc2626',
          blue: '#2563eb',
        },

        // Material Design 3 (M3) Surface Elevation Levels mapped to dynamic theme vars
        m3: {
          surface: 'var(--arvan-bg, #f8fafc)',
          'surface-1': 'var(--arvan-surface, #ffffff)',
          'surface-2': 'var(--arvan-bg, #f1f5f9)',
          'surface-3': 'var(--arvan-surface, #ffffff)',
          'surface-4': 'var(--arvan-border, #e2e8f0)',
          'surface-5': '#cbd5e1',
          'surface-variant': 'var(--arvan-bg, #f1f5f9)',
          'on-surface': 'var(--arvan-text, #0f172a)',
          'on-surface-variant': 'var(--arvan-text-muted, #64748b)',
          outline: 'var(--arvan-border, rgba(0, 0, 0, 0.08))',
          'outline-variant': 'rgba(0, 0, 0, 0.04)',
          primary: 'var(--arvan-primary, #008b8b)',
          'on-primary': '#ffffff',
          'primary-container': 'var(--arvan-primary-light, #e6f7f7)',
          'on-primary-container': 'var(--arvan-teal-dark, #004f50)',
          secondary: 'var(--arvan-secondary, #e11d48)',
          'secondary-container': '#fdf2f8',
          'on-secondary-container': '#831843',
        },

        primary: {
          DEFAULT: 'var(--arvan-primary, #008b8b)',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: 'var(--arvan-secondary, #0b3a42)',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: 'var(--arvan-error, hsl(var(--destructive)))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'var(--arvan-bg, #f1f5f9)',
          foreground: 'var(--arvan-text-muted, #64748b)',
        },
        accent: {
          DEFAULT: 'var(--arvan-primary-light, #e6f7f7)',
          foreground: 'var(--arvan-teal-dark, #004f50)',
        },
        popover: {
          DEFAULT: 'var(--arvan-surface, #ffffff)',
          foreground: 'var(--arvan-text, #0f172a)',
        },
        card: {
          DEFAULT: 'var(--arvan-surface, #ffffff)',
          foreground: 'var(--arvan-text, #0f172a)',
        },
      },
      borderRadius: {
        none: '0px',
        sm: 'calc(var(--arvan-radius, 16px) * 0.4)',
        DEFAULT: 'var(--arvan-radius, 16px)',
        md: 'calc(var(--arvan-radius, 16px) * 0.65)',
        lg: 'var(--arvan-radius, 16px)',
        xl: 'calc(var(--arvan-radius, 16px) * 1.15)',
        '2xl': 'calc(var(--arvan-radius, 16px) * 1.35)',
        '3xl': 'calc(var(--arvan-radius, 16px) * 1.65)',
        '4xl': 'calc(var(--arvan-radius, 16px) * 2.2)',
        full: '9999px',
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
