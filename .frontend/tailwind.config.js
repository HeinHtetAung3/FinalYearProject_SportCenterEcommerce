/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '1rem',
                sm: '1.5rem',
                lg: '2rem',
                xl: '2.5rem'
            }
        },
        extend: {
            colors: {
                ink: {
                    DEFAULT: '#0a0a0a',
                    50: '#f6f6f6',
                    100: '#e7e7e7',
                    200: '#d1d1d1',
                    300: '#b0b0b0',
                    400: '#888888',
                    500: '#6d6d6d',
                    600: '#5d5d5d',
                    700: '#4a4a4a',
                    800: '#1f1f1f',
                    900: '#111111',
                    950: '#0a0a0a'
                },
                accent: {
                    DEFAULT: '#ff5a1f',
                    50: '#fff2ec',
                    100: '#ffe2d3',
                    200: '#ffc1a1',
                    300: '#ff9b6b',
                    400: '#ff7a3e',
                    500: '#ff5a1f',
                    600: '#e8420c',
                    700: '#bf3209',
                    800: '#922308',
                    900: '#5e1604'
                },
                volt: {
                    DEFAULT: '#b6ff3c',
                    50: '#f6ffe6',
                    100: '#ecffcc',
                    200: '#daff99',
                    300: '#c6ff66',
                    400: '#b6ff3c',
                    500: '#92e600',
                    600: '#6db300',
                    700: '#4d8000',
                    800: '#2f4f00',
                    900: '#172500'
                },
                bone: '#fafafa'
            },
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
                display: ['"Space Grotesk"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
            },
            fontSize: {
                '2xs': ['0.6875rem', {
                    lineHeight: '1rem'
                }]
            },
            letterSpacing: {
                tightest: '-0.04em'
            },
            borderRadius: {
                '4xl': '2rem'
            },
            boxShadow: {
                soft: '0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 24px -12px rgba(0, 0, 0, 0.08)',
                card: '0 1px 2px rgba(0, 0, 0, 0.04), 0 12px 32px -16px rgba(0, 0, 0, 0.18)',
                glow: '0 10px 40px -12px rgba(255, 90, 31, 0.45)'
            },
            keyframes: {
                'fade-in': {
                    '0%': {
                        opacity: 0,
                        transform: 'translateY(8px)'
                    },
                    '100%': {
                        opacity: 1,
                        transform: 'translateY(0)'
                    }
                },
                'fade-in-up': {
                    '0%': {
                        opacity: 0,
                        transform: 'translateY(24px)'
                    },
                    '100%': {
                        opacity: 1,
                        transform: 'translateY(0)'
                    }
                },
                'slide-down': {
                    '0%': {
                        opacity: 0,
                        transform: 'translateY(-8px)'
                    },
                    '100%': {
                        opacity: 1,
                        transform: 'translateY(0)'
                    }
                },
                marquee: {
                    '0%': {
                        transform: 'translateX(0)'
                    },
                    '100%': {
                        transform: 'translateX(-50%)'
                    }
                },
                shimmer: {
                    '0%': {
                        backgroundPosition: '-400px 0'
                    },
                    '100%': {
                        backgroundPosition: '400px 0'
                    }
                }
            },
            animation: {
                'fade-in': 'fade-in 0.4s ease-out both',
                'fade-in-up': 'fade-in-up 0.6s ease-out both',
                'slide-down': 'slide-down 0.25s ease-out both',
                marquee: 'marquee 30s linear infinite',
                shimmer: 'shimmer 1.6s linear infinite'
            }
        }
    },
    plugins: []
};