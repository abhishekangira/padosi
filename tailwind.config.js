/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#94d2ff",
          DEFAULT: "#5bbaff",
          dark: "#2b7db8",
        },
      },
      boxShadow: {
        neu: "7px 7px 13px #06080f, -7px -7px 13px #32162b",
      },
      animation: {
        fade: "fade 1s ease-in",
      },
      keyframes: {
        fade: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#5bbaff",
          secondary: "#D926AA",
          accent: "#1FB2A5",
          neutral: "#191D24",
          "neutral-focus": "#666666",
          "base-100": "#1b2735",
          info: "#3ABFF8",
          success: "#36D399",
          warning: "#FBBD23",
          error: "#F87272",
        },
      },
    ],
  },
};
