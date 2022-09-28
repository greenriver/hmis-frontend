import { experimental_sx as sx, ThemeOptions } from '@mui/material';

// to have typed safe, Button need to provide extra type that can be augmented
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    gray: true;
  }
}

const theme: ThemeOptions = {
  typography: {
    fontFamily: "'Open Sans', sans-serif",
    h1: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 18,
      fontWeight: 600,
    },
    h2: {
      fontFamily: "'Montserrat', sans-serif",
    },
    h3: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 24,
    },
    h4: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 20,
      fontWeight: 600,
    },
    h5: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 18,
    },
    h6: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 12,
      textTransform: 'uppercase',
      color: '#10182899',
    },
    button: {
      textTransform: 'none',
    },
    // fontSize: 14,
    // htmlFontSize: 18,
  },
  palette: {
    background: {
      default: '#F9F9F9',
    },
    secondary: {
      main: '#75559F',
    },
    error: {
      main: '#B23842',
    },
  },
  components: {
    // MuiTypography: {
    //   styleOverrides: {
    //     root: {
    //       fontSize: '0.875rem',
    //     },
    //   },
    // },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'white',
        },
      },
    },
    MuiDatePicker: {
      defaultProps: {
        inputFormat: 'MM/dd/yyyy',
      },
    },
    MuiLink: {
      defaultProps: {
        variant: 'body2',
      },
      styleOverrides: {
        root: sx({
          cursor: 'pointer',
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiButtonBase: {
      defaultProps: {
        // disableRipple: true,
      },
      styleOverrides: {
        root: {
          '&.Mui-focusVisible': {
            // borderWidth: 3,
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        variant: 'contained',
        disableElevation: true,
      },
      variants: [
        {
          props: { variant: 'gray' },
          style: {
            backgroundColor: '#EDEDED',
          },
        },
      ],
      // "bold" styled buttons
      styleOverrides: {
        outlined: {
          fontWeight: 600,
          // borderWidth: '2px',
          // lineHeight: 'initial',
          // '&:hover': {
          //   borderWidth: '2px',
          // },
        },
        contained: {
          fontWeight: 600,
          // borderWidth: '2px',
          // '&:hover': {
          //   borderWidth: '2px',
          // },
        },
      },
    },
    MuiAutocomplete: {
      defaultProps: {
        size: 'small',
        openOnFocus: true,
      },
      styleOverrides: {
        groupLabel: { lineHeight: 2, paddingLeft: 10 },
        option: { paddingLeft: 16 },
      },
    },
  },
};

export default theme;
