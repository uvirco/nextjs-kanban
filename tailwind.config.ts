import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./ui/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  darkMode: ["class", "class"],
  plugins: [
    nextui({
      themes: {
        red: { extend: "dark", colors: { primary: { DEFAULT: "#ef4444" } } },
        orange: { extend: "dark", colors: { primary: { DEFAULT: "#f97316" } } },
        amber: { extend: "dark", colors: { primary: { DEFAULT: "#f59e0b" } } },
        yellow: { extend: "dark", colors: { primary: { DEFAULT: "#eab308" } } },
        lime: { extend: "dark", colors: { primary: { DEFAULT: "#84cc16" } } },
        green: { extend: "dark", colors: { primary: { DEFAULT: "#22c55e" } } },
        emerald: {
          extend: "dark",
          colors: { primary: { DEFAULT: "#10b981" } },
        },
        teal: { extend: "dark", colors: { primary: { DEFAULT: "#14b8a6" } } },
        cyan: { extend: "dark", colors: { primary: { DEFAULT: "#06b6d4" } } },
        sky: { extend: "dark", colors: { primary: { DEFAULT: "#0ea5e9" } } },
        blue: { extend: "dark", colors: { primary: { DEFAULT: "#3b82f6" } } },
        indigo: { extend: "dark", colors: { primary: { DEFAULT: "#6366f1" } } },
        violet: { extend: "dark", colors: { primary: { DEFAULT: "#8b5cf6" } } },
        purple: { extend: "dark", colors: { primary: { DEFAULT: "#a855f7" } } },
        fuchsia: {
          extend: "dark",
          colors: { primary: { DEFAULT: "#d946ef" } },
        },
        pink: { extend: "dark", colors: { primary: { DEFAULT: "#ec4899" } } },
        rose: { extend: "dark", colors: { primary: { DEFAULT: "#f43f5e" } } },
      },
    }),
      require("tailwindcss-animate")
],
};
export default config;
