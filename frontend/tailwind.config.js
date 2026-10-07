/** @type {import('tailwindcss').Config} */
module.exports = {
    blocklist: ["overline"],
    darkMode: ["class"],
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    theme: {
        extend: {
            fontFamily: {
                serif: ['"Noto Serif"', '"Noto Serif Devanagari"', "serif"],
                sans: ['"Noto Sans"', '"Noto Sans Devanagari"', "system-ui", "sans-serif"],
            },
            colors: {
                cream: "#F7EFE2",
                olive: "#4A5A1E",
                "olive-dark": "#3a4718",
                gold: "#B8862B",
                "gold-dark": "#9a701f",
                brown: "#7A4A12",
                terracotta: "#C4694A",
                deepred: "#8B2A1A",
                wa: "#25C05F",
                sand: "#D3C7AC",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
                popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
                primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
                secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
                muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
                accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
                destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            keyframes: {
                "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
                "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
                "wave-pulse": {
                    "0%, 100%": { transform: "scaleY(0.3)" },
                    "50%": { transform: "scaleY(1)" },
                },
                "fade-up": { "0%": { opacity: 0, transform: "translateY(10px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "wave-pulse": "wave-pulse 0.8s ease-in-out infinite",
                "fade-up": "fade-up 0.35s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
