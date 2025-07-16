import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: {
				DEFAULT: '1rem',
				sm: '1.5rem',
				lg: '2rem',
				xl: '2rem',
				'2xl': '2rem',
			},
			screens: {
				sm: '640px',
				md: '768px',
				lg: '1024px',
				xl: '1280px',
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Wedding App Brand Colors
				wedding: {
					navy: 'hsl(var(--wedding-navy))',
					cream: 'hsl(var(--wedding-cream))',
					'navy-light': 'hsl(var(--wedding-navy-light))',
					'cream-dark': 'hsl(var(--wedding-cream-dark))',
				},
				// Glass Effect Colors
				glass: {
					white: 'hsl(var(--glass-white))',
					black: 'hsl(var(--glass-black))',
					navy: 'hsl(var(--glass-navy))',
					cream: 'hsl(var(--glass-cream))',
					blue: 'hsl(var(--glass-blue-tint))',
					purple: 'hsl(var(--glass-purple-tint))',
					pink: 'hsl(var(--glass-pink-tint))',
					green: 'hsl(var(--glass-green-tint))',
				},
			},
			fontFamily: {
				inter: ['Inter', 'sans-serif'],
				dolly: ['Playfair Display', 'serif'],
			},
			fontSize: {
				'wedding-display': ['4rem', {
					lineHeight: '1',
					letterSpacing: '-0.025em',
					fontWeight: '300',
				}],
				'wedding-heading': ['2.5rem', {
					lineHeight: '1.1',
					letterSpacing: '-0.025em',
					fontWeight: '500',
				}],
				'wedding-subheading': ['1.5rem', {
					lineHeight: '1.4',
					fontWeight: '400',
				}],
			},
			blur: {
				'glass-sm': '10px',
				'glass': '20px',
				'glass-lg': '30px',
				'glass-xl': '40px',
			},
			backdropBlur: {
				'glass-sm': '10px',
				'glass': '20px',
				'glass-lg': '30px',
				'glass-xl': '40px',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'glass': '1rem',
				'glass-lg': '1.5rem',
				'glass-xl': '2rem',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'glass-float': {
					'0%, 100%': {
						transform: 'translateY(0px) rotate(0deg)'
					},
					'50%': {
						transform: 'translateY(-10px) rotate(1deg)'
					}
				},
				'fade-up': {
					from: {
						opacity: '0',
						transform: 'translateY(30px)'
					},
					to: {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					from: {
						opacity: '0',
						transform: 'scale(0.9)'
					},
					to: {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '-100% 0'
					},
					'100%': {
						backgroundPosition: '100% 0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glass-float': 'glass-float 6s ease-in-out infinite',
				'fade-up': 'fade-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards',
				'scale-in': 'scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
				'shimmer': 'shimmer 2s linear infinite',
			},
			boxShadow: {
				'glass': '0 8px 32px hsl(0 0% 0% / 0.08), inset 0 0 0 1px hsl(0 0% 100% / 0.2)',
				'glass-lg': '0 16px 40px hsl(0 0% 0% / 0.1), inset 0 0 0 1px hsl(0 0% 100% / 0.3)',
				'glass-sm': '0 4px 16px hsl(0 0% 0% / 0.04), inset 0 0 0 1px hsl(0 0% 100% / 0.1)',
			},
			spacing: {
				'glass-nav': '104px', // Space for glass navigation
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
