/* eslint-disable sort-keys-fix/sort-keys-fix */

module.exports = {
  purge: [],
  darkMode: 'class', // false or 'media' or 'class'
  theme: {
    backgroundSize: {
      auto: 'auto',
      cover: 'cover',
      contain: 'contain',
      '50%': '50%',
    },
    letterSpacing: {
      tight: '-0.019em',
    },
    screens: {
      xs: '360px',
      // => @media (min-width: 360px) { ... }

      sm: '640px',
      // => @media (min-width: 640px) { ... }

      md: '768px',
      // => @media (min-width: 768px) { ... }

      lg: '1024px',
      // => @media (min-width: 1024px) { ... }

      xl: '1280px',
      // => @media (min-width: 1280px) { ... }

      '2xl': '1536px',
      // => @media (min-width: 1536px) { ... }
    },
    extend: {
      colors: {
        hero: {
          bluelight: '#71D9FA',
          purplelight: '#BB9BFF',
          bluedark: '#42CAF5',
          purpledark: '#9768FC',
        },
        red: {
          800: '#F84E55',
          700: '#F55065',
          600: '#D64D54',
        },
        blue: {
          700: '#3339D9',
          600: '#1D5CFF',
          500: '#2B32CB',
        },
        light: '#f0f0f2',
        dark: '#141417',
      },
      fontSize: {
        '2xs': '.625rem', // 10px
      },
      fontFamily: {
        system: [
          'ui-sans-serif',
          'system-ui',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      backgroundImage: {
        'blur-bg': 'url("/images/blur-lg.webp")',
      },
      gridTemplateColumns: {
        'items-compact': 'repeat(auto-fill,minmax(155px,1fr))',
        'items-base': 'repeat(auto-fill,minmax(215px,1fr))',
        'items-large': 'repeat(auto-fill,minmax(275px,1fr))',
        'items-xl': 'repeat(auto-fill,minmax(335px,1fr))',
        'page-layout': '400px 2fr',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
