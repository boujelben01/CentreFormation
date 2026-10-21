import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
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
        sans: ["var(--font-body)"],
        display: ["var(--font-display)"],
        mono: ["var(--font-mono)"],
      },
      colors: {
        // --- shadcn/ui (triplets HSL --ui-*, alpha possible : bg-primary/10) ---
        border: "hsl(var(--ui-border))",
        input: "hsl(var(--ui-input))",
        ring: "hsl(var(--ui-ring))",
        background: "hsl(var(--ui-background))",
        foreground: "hsl(var(--ui-foreground))",
        primary: {
          DEFAULT: "hsl(var(--ui-primary))",
          foreground: "hsl(var(--ui-primary-foreground))",
          soft: "var(--primary-soft)",
          "soft-text": "var(--primary-soft-text)",
          text: "var(--primary-text)",
        },
        secondary: {
          DEFAULT: "hsl(var(--ui-secondary))",
          foreground: "hsl(var(--ui-secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--ui-destructive))",
          foreground: "hsl(var(--ui-destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--ui-muted))",
          foreground: "hsl(var(--ui-muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--ui-accent))",
          foreground: "hsl(var(--ui-accent-foreground))",
          soft: "var(--accent-soft)",
          text: "var(--accent-text)",
        },
        popover: {
          DEFAULT: "hsl(var(--ui-popover))",
          foreground: "hsl(var(--ui-popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--ui-card))",
          foreground: "hsl(var(--ui-card-foreground))",
        },
        // --- statuts : DEFAULT/foreground = aplat ; bg/text/border = badge doux ---
        success: {
          DEFAULT: "hsl(var(--ui-success))",
          foreground: "hsl(var(--ui-success-foreground))",
          bg: "var(--success-bg)",
          "bg-strong": "var(--success-bg-strong)",
          text: "var(--success-text)",
          border: "var(--success-border)",
        },
        warning: {
          DEFAULT: "hsl(var(--ui-warning))",
          foreground: "hsl(var(--ui-warning-foreground))",
          bg: "var(--warning-bg)",
          "bg-strong": "var(--warning-bg-strong)",
          text: "var(--warning-text)",
          border: "var(--warning-border)",
        },
        danger: {
          DEFAULT: "hsl(var(--ui-destructive))",
          foreground: "hsl(var(--ui-destructive-foreground))",
          bg: "var(--danger-bg)",
          "bg-strong": "var(--danger-bg-strong)",
          text: "var(--danger-text)",
          border: "var(--danger-border)",
        },
        info: {
          DEFAULT: "hsl(var(--ui-info))",
          foreground: "hsl(var(--ui-info-foreground))",
          bg: "var(--info-bg)",
          "bg-strong": "var(--info-bg-strong)",
          text: "var(--info-text)",
          border: "var(--info-border)",
        },
        // --- familles de marque : teal (secondaire), corail (tertiaire) ---
        teal: {
          DEFAULT: "var(--secondary-solid)",
          foreground: "var(--secondary-on-solid)",
          bg: "var(--secondary-bg)",
          "bg-strong": "var(--secondary-bg-strong)",
          text: "var(--secondary-text)",
          border: "var(--secondary-border)",
        },
        coral: {
          DEFAULT: "var(--tertiary-solid)",
          foreground: "var(--tertiary-on-solid)",
          bg: "var(--tertiary-bg)",
          "bg-strong": "var(--tertiary-bg-strong)",
          text: "var(--tertiary-text)",
          border: "var(--tertiary-border)",
        },
        // --- surfaces / textes issus des tokens ---
        surface: {
          DEFAULT: "var(--surface)",
          2: "var(--surface-2)",
          sunken: "var(--surface-sunken)",
        },
        subtle: "var(--text-subtle)",
        // --- catégories de cours : bg-cat-dev-bg text-cat-dev-text … ---
        cat: Object.fromEntries(
          ["dev", "data", "design", "gestion", "langues", "reseaux"].map((c) => [
            c,
            {
              bg: `var(--cat-${c}-bg)`,
              text: `var(--cat-${c}-text)`,
              solid: `var(--cat-${c}-solid)`,
              border: `var(--cat-${c}-border)`,
              "on-solid": `var(--cat-${c}-on-solid)`,
            },
          ]),
        ),
        // --- pastilles de KPI : bg-stat-primary-bg text-stat-primary-fg ---
        stat: Object.fromEntries(
          ["primary", "secondary", "tertiary", "info", "accent", "success"].map((c) => [
            c,
            { bg: `var(--stat-${c}-bg)`, fg: `var(--stat-${c}-fg)` },
          ]),
        ),
        // --- avatars à initiales : bg-avatar-1-bg text-avatar-1-fg (1..8) ---
        avatar: Object.fromEntries(
          [1, 2, 3, 4, 5, 6, 7, 8].map((n) => [n, { bg: `var(--avatar-${n}-bg)`, fg: `var(--avatar-${n}-fg)` }]),
        ),
        // --- graphiques : fill-chart-1 / stroke-chart-1 / bg-chart-1 (1..8) ---
        chart: Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((n) => [n, `var(--chart-${n})`])),
        sidebar: {
          DEFAULT: "hsl(var(--ui-sidebar-background))",
          foreground: "hsl(var(--ui-sidebar-foreground))",
          primary: "hsl(var(--ui-sidebar-primary))",
          "primary-foreground": "hsl(var(--ui-sidebar-primary-foreground))",
          accent: "hsl(var(--ui-sidebar-accent))",
          "accent-foreground": "hsl(var(--ui-sidebar-accent-foreground))",
          border: "hsl(var(--ui-sidebar-border))",
          ring: "hsl(var(--ui-sidebar-ring))",
          muted: "hsl(var(--ui-sidebar-muted))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        "card-hover": "var(--shadow-card-hover)",
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
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
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-10px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
