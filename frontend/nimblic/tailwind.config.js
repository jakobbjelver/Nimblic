/** @type {import('tailwindcss').Config} */
export default {
  mode: 'jit',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'nunito': ['Poppins'],
        display: 'Oswald, ui-serif', // Adds a new `font-display` class
        // Add other font families as needed
      },
      borderColor: {
        'drop' : 'rgba(209, 213, 219, 0.5)'
      },
      backgroundSize: {
        'size-200': '200% 200%',
    },
    backgroundPosition: {
        'pos-0': '0% 0%',
        'pos-100': '100% 100%',
    },
    },
  },

  plugins: [require("@tailwindcss/typography"), require("daisyui")],

  daisyui: {
    themes: [
      {
        light: {

          "primary": "#7952f7",

          "secondary": "#6865f7",

          "accent": "#F99417",

          "neutral": "#ebebf0",
          "neutral-focus": "#c9c9c9",

          "base-100": "#eeedf0",
          "base-200": "#f5f5f5",
          "base-300" : "#fcfcfc",


          "info": "#8c98ff",

          "success": "#14b8a6",

          "warning": "#df8a0c",

          "error": "#ed7668",
        },
        dark: {

          "primary": "#7952f7",

          "secondary": "#6865f7",

          "accent": "#F99417",

          "neutral": "#191f2e",
          "neutral-focus": "#242c40",

          "base-100": "#111214",
          "base-200": "#161921",
          "base-300": "#12141a",  

          "info": "#4d5fff",

          "success": "#14b8a6",

          "warning": "#df8a0c",

          "error": "#ed7668",
        },
      },
    ],
  }
}

