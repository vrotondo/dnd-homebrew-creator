/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'dnd-red': '#E4002B',
                'dnd-black': '#1A1A1A',
                'parchment': '#F5F5DC',
                'ink': '#36454F',
                'primary': {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
            },
            fontFamily: {
                'medieval': ['MedievalSharp', 'cursive'],
                'fantasy': ['Cinzel', 'serif'],
                'manuscript': ['Fondamento', 'cursive'],
            },
            backgroundImage: {
                'parchment-texture': "url('/src/assets/parchment.jpg')",
            },
        },
    },
    plugins: [],
}