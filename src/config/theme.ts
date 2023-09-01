import { Theme } from '@mui/material';
import {
  createTheme,
  ThemeOptions,
  PaletteColor,
  SimplePaletteColorOptions,
} from '@mui/material/styles';
import { deepmerge } from '@mui/utils';

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

  interface StepperPaletteOptions {
    color: string;
    background: string;
  }

  interface Palette {
    borders: PaletteColor;
    alerts: Record<string, string>;
    links: string;
    stepper: {
      empty: StepperPaletteOptions;
      complete: StepperPaletteOptions;
      changed: StepperPaletteOptions;
      warning: StepperPaletteOptions;
      error: StepperPaletteOptions;
      // empty: {
      //   color: '#0000003B',
      //   background: '#FFF'
      // },
      // complete: {
      //   color: '#000000DE',
      //   background: '#FFF',
      // }
    };
  }
  interface PaletteOptions {
    borders: SimplePaletteColorOptions;
    alerts: { lightWarningBackground?: string };
    links: string;
    stepper: {
      empty: StepperPaletteOptions;
      complete: StepperPaletteOptions;
      changed: StepperPaletteOptions;
      warning: StepperPaletteOptions;
      error: StepperPaletteOptions;
    };
  }
}

// Default base theme, to be merged with overlays
export const baseThemeDef: ThemeOptions = {
  typography: {
    fontFamily: '"Open Sans", sans-serif',
    fontWeightBold: 600,
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
      lightWarningBackground: '#fffde0',
    },
    links: '#1976D2',
    stepper: {
      empty: {
        color: '#0000003B',
        background: '#FFF',
      },
      complete: {
        color: '#000000DE',
        background: '#FFF',
      },
      changed: {
        color: '#75559F', // Mui Purple 700?
        background: '#EDE7F6', // Deep Purple 50
      },
      warning: {
        color: '#F57C00', // Mui Orange 700
        background: '#FFF3E0', // Mui Orange 50
      },
      error: {
        color: '#D50000', // Mui Red A700
        background: '#FEEBEE', // Mui Red 50
      },
    },
  },
};

// Create theme options to use for composition
// See: https://mui.com/material-ui/customization/theming/#createtheme-options-args-theme
const createThemeOptions = (theme: Theme) => ({
  typography: {
    h1: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 20,
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
      fontSize: 14,
      // color: '#10182899',
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
        sizeMedium: theme.unstable_sx({
          py: '8px',
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.background.paper,
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
        root: theme.unstable_sx({
          color: theme.palette.links,
          textDecorationColor: theme.palette.links,
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
        root: theme.unstable_sx({
          '&.Mui-disabled': {
            color: 'red',
            backgroundColor: theme.palette.grey[100],
          },
        }),
        input: {
          '&::placeholder': {
            opacity: 0.6,
          },
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
          backgroundColor: theme.palette.background.paper,
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
    MuiDialogTitle: {
      defaultProps: {
        color: 'text.primary',
        typography: 'h4',
      },
      styleOverrides: {
        root: theme.unstable_sx({
          textTransform: 'none',
          fontWeight: 400,
          pb: 2,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'borders.light',
        }),
      },
    },
    // MuiDialogContent: {
    //   styleOverrides: {
    //     root: theme.unstable_sx({}),
    //   },
    // },
    MuiDialogActions: {
      styleOverrides: {
        root: theme.unstable_sx({
          borderTopWidth: 1,
          borderTopStyle: 'solid',
          borderTopColor: theme.palette.borders.light,
          px: 4,
          py: 2,
        }),
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '1em',
        },
      },
    },
  },
});

export const createFullTheme = (options?: ThemeOptions) => {
  // Create theb ase theme, merged with any overlays from the backend
  const theme = createTheme(deepmerge(baseThemeDef, options || {}));
  // Create the full theme with composition
  return createTheme(theme, createThemeOptions(theme));
};

// Export default theme with no overlay options
export default createFullTheme();
