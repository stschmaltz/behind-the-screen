import { extendTheme } from '@chakra-ui/react';

const brandPrimary = '#7FBFC9';
const brandDark = '#1D6F92';
const brandLight = '#C4DCE4';
const firstAccent = '#68BFDE';
const secondAccent = '#F0D411';

const colors = {
  backgroundColor: '#061727',
  brandPrimary,
  brandLight,
  brandDark,
  firstAccent,
  secondAccent,
  brandPrimaryColors: {
    '50': '#C0DEE5',
    '100': '#B3D8E2',
    '200': '#A7D2DF',
    '300': '#9ACCD9',
    '400': brandPrimary,
    '500': '#7FBFC9',
    '600': '#72B8BF',
    '700': '#65B2B6',
    '800': '#58ACAD',
    '900': '#4BA5A3',
  },
  brandSecondaryColors: {
    '50': '#478CA2',
    '100': '#3A8699',
    '200': '#2D8190',
    '300': brandDark,
    '400': '#206C84',
    '500': '#13657B',
    '600': '#065F72',
    '700': '#005868',
    '800': '#004E5F',
    '900': '#004556',
  },
  accent1: {
    '50': '#FFF0F5',
    '100': '#FFD2E5',
    '200': '#FFB6D4',
    '300': '#FF9AC3',
    '400': '#FF7FAF',
    '500': '#FF649C',
    '600': '#E65B8A',
    '700': '#CC5278',
    '800': '#B04865',
    '900': '#964552',
  },
  accent2: {
    '50': '#FCEAE9',
    '100': '#F8D5D4',
    '200': '#F4BFBF',
    '300': '#F0AAAA',
    '400': '#EC9595',
    '500': '#E88181',
    '600': '#C87171',
    '700': '#A96161',
    '800': '#874F4F',
    '900': '#653E3E',
  },
  graviton: {
    '50': '#F6F0FF',
    '100': '#ECE1FF',
    '200': '#DFD1FF',
    '300': '#D2C1FF',
    '400': '#C5B1FF',
    '500': '#B8A2FF',
    '600': '#AB92FF',
    '700': '#9E83FF',
    '800': '#9173FF',
    '900': '#8464FF',
  },
  photon: {
    '50': '#FFF6E0',
    '100': '#FFECC1',
    '200': '#FFDFA1',
    '300': '#FFD381',
    '400': '#FFC661',
    '500': '#FFB942',
    '600': '#FFAC23',
    '700': '#FFA104',
    '800': '#FF9604',
    '900': '#FF8904',
  },
};

const activeLabelStyles = {
  transform: 'scale(0.85) translateY(24px)',
};

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  components: {
    Form: {
      variants: {
        floating: {
          container: {
            _focusWithin: {
              label: {
                ...activeLabelStyles,
              },
            },
            'input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, textarea:not(:placeholder-shown) ~ label':
              {
                ...activeLabelStyles,
              },
            label: {
              top: 0,
              left: 0,
              zIndex: 2,
              position: 'absolute',
              backgroundColor: 'white',
              pointerEvents: 'none',
              mx: 3,
              px: 1,
              my: 2,
              transformOrigin: 'left top',
            },
          },
        },
      },
    },
    fonts: {
      heading: `'Montserrat', sans-serif`,
      body: `'Open Sans', sans-serif`,
    },
    Text: {
      baseStyle: {
        color: 'gray.800',
        fontSize: 'lg',
      },
      variants: {
        bold: {
          fontWeight: 'bold',
          m: 0,
          display: 'inline-block',
        },
        h1: {
          color: 'gray.800',
          fontWeight: 'bold',
          fontSize: '4xl',
        },
        h2: {
          color: 'gray.800',
          fontWeight: 'bold',
          fontSize: '3xl',
        },
        h3: {
          color: 'gray.800',
          fontWeight: 'bold',
          fontSize: '2xl',
        },
      },
    },
  },
  colors: {
    transparent: 'transparent',
    lightShade: '#FBFFF8',
    primary: colors.brandPrimary,
    secondary: colors.brandDark,
    firstAccent: colors.firstAccent,
    secondAccent: colors.secondAccent,

    brandPrimary: colors.brandPrimaryColors,
    brandSecondary: colors.brandSecondaryColors,
    accent1: colors.accent1,
    accent2: colors.accent2,
    graviton: colors.graviton,
    photon: colors.photon,
  },
  styles: {
    global: {
      body: {
        bgImage: "url('/images/dark-space-background.jpg')",
        bgPosition: 'center',
        bgRepeat: 'no-repeat',
        bgSize: 'cover',
        p: 0,
        m: 0,
        lineHeight: '1.5',
        minHeight: '100vh',
      },
      a: {
        fontSize: 'lg',
        color: colors.brandDark,
        _hover: {
          textDecoration: 'underline',
        },
      },
    },
  },
});

export { theme, brandPrimary };
