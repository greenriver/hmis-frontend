import {
  createTheme,
  ThemeOptions,
  PaletteColor,
  SimplePaletteColorOptions,
} from '@mui/material/styles';

// to have typed safe, Button need to provide extra type that can be augmented
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    gray: true;
    transparent: true;
  }
}

declare module '@mui/material/styles' {
  // interface TypographyVariants {
  //   body3: React.CSSProperties;
  // }

  // // allow configuration using `createTheme`
  // interface TypographyVariantsOptions {
  //   body3?: React.CSSProperties;
  // }

  interface Palette {
    borders: PaletteColor;
    alerts: Record<string, string>;
  }
  interface PaletteOptions {
    borders: SimplePaletteColorOptions;
    alerts: { lightWarningBackground?: string };
  }
}

// Dynamic installation-specific theming
export const baseThemeDef: ThemeOptions = {
  // For some reason this declaration has to be included here rather than below to take effect
  typography: {
    fontFamily: '"Open Sans", sans-serif',
  },
  palette: {
    primary: {
      main: '#1976D2',
    },
    background: {
      default: '#F9F9F9',
    },
    secondary: {
      main: '#75559F',
    },
    error: {
      main: '#D32F2F',
    },
    borders: {
      light: '#E5E5E5',
      dark: '#c9c9c9',
      main: '#c9c9c9',
    },
    alerts: {
      lightWarningBackground: '#FFF9EB',
    },
  },
};

export const baseTheme = createTheme(baseThemeDef);

export const fullThemeDef = {
  typography: {
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
    MuiTypography: {
      styleOverrides: {
        h4: {
          // marginBottom: 16,
          // color: 'red',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
        variant: 'outlined',
      },
    },
    MuiTableCell: {
      styleOverrides: {
        sizeMedium: baseTheme.unstable_sx({
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
        root: baseTheme.unstable_sx({
          cursor: 'pointer',
          '&.Mui-focusVisible': {
            outlineOffset: '4px',
          },
        }),
      },
    },
    MuiInputBase: {
      styleOverrides: {
        sizeSmall: {
          fontSize: '0.875rem',
        },
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
    MuiLoadingButton: {
      defaultProps: {
        variant: 'contained',
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
};

export const fullTheme = createTheme(baseTheme, fullThemeDef);

export default fullTheme;
