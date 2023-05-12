/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
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
          primary: "#5b9fff",
          "primary-focus": "#3ACFFF",
          secondary: "#64748b",
          accent: "#1FB2A5",
          neutral: "#003154",
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
