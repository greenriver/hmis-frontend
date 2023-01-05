import { createTheme, experimental_sx as sx } from '@mui/material';

// to have typed safe, Button need to provide extra type that can be augmented
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    gray: true;
  }
}

// Dynamic installation-specific theming
const theme = createTheme({
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
});

export default createTheme(theme, {
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

  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 0,
        variant: 'outlined',
      },
    },
    MuiTableCell: {
      styleOverrides: {
        sizeMedium: sx({
          py: '8px',
        }),
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
          '&.Mui-focusVisible': {
            outlineOffset: '4px',
          },
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
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          '&.Mui-focusVisible': {
            outlineColor: '-webkit-focus-ring-color',
            outlineWidth: '2px',
            outlineStyle: 'auto',
            outlineOffset: '4px',
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          '&.Mui-focusVisible': {
            outlineOffset: '-6px',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&.Mui-focusVisible': {
            outlineOffset: '-4px',
            outlineRadius: 0,
            borderRadius: 0,
          },
        },
      },
    },
    MuiSwitch: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        switchBase: {
          '&.Mui-focusVisible': {
            outline: '2px solid -webkit-focus-ring-color',
            outlineOffset: '-2px',
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-focusVisible': {
            outlineOffset: '-1px',
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
          backgroundColor: 'white',
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
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: 0,
        },
      },
    },
  },
});
