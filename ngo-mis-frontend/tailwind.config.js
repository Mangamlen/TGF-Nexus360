const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))", // Emerald Green
          foreground: "hsl(var(--primary-foreground))", // Soft White
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))", // Muted Teal
          foreground: "hsl(var(--secondary-foreground))", // Soft White
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))", // Rejected Red
          foreground: "hsl(var(--destructive-foreground))", // Soft White
        },
        muted: {
          DEFAULT: "hsl(var(--muted))", // Darker Navy
          foreground: "hsl(var(--muted-foreground))", // Locked Gray
        },
        accent: {
          DEFAULT: "hsl(var(--accent))", // Muted Teal
          foreground: "hsl(var(--accent-foreground))", // Soft White
        },
        popover: {
          DEFAULT: "hsl(var(--popover))", // Soft White
          foreground: "hsl(var(--popover-foreground))", // Deep Navy
        },
        card: {
          DEFAULT: "hsl(var(--card))", // Soft White
          foreground: "hsl(var(--card-foreground))", // Deep Navy
        },
        
        // Status Colors - map directly to new status variables
        'status-approved': 'hsl(var(--status-approved))',
        'status-pending': 'hsl(var(--status-pending))',
        'status-rejected': 'hsl(var(--status-rejected))',
        'status-locked': 'hsl(var(--status-locked))',
        
        // Custom color names for clarity (optional, but good for design system)
        'deep-navy': 'hsl(var(--background))',
        'soft-white': 'hsl(var(--card))',
        'emerald-green': 'hsl(var(--primary))',
        'muted-teal': 'hsl(var(--secondary))',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        soft: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // A slightly more pronounced but soft shadow
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function ({ addUtilities, theme }) {
      addUtilities({
        '.hover\\:button-glow-primary:hover': {
          boxShadow: `0 0 15px -3px hsl(var(--primary)), 0 0 5px hsl(var(--primary))`,
        },
        '.glow-primary-subtle': {
          boxShadow: `0 0 8px -2px hsl(var(--primary)), 0 0 3px hsl(var(--primary))`,
        },
      });
    },
  ],
}
