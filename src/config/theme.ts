import { Theme } from '@mui/material';
import {
  PaletteColor,
  SimplePaletteColorOptions,
  ThemeOptions,
  createTheme,
} from '@mui/material/styles';
import { deepmerge } from '@mui/utils';

// to have typed safe, Button need to provide extra type that can be augmented
declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    gray: true;
    transparent: true;
  }
}

declare module '@mui/material/Alert' {
  interface AlertPropsVariantOverrides {
    withHeader: true;
  }
  interface AlertPropsColorOverrides {
    low: true;
    medium: true;
    high: true;
  }
}

declare module '@mui/material/styles' {
  interface TypographyVariants {
    body3: React.CSSProperties;
    cardTitle?: React.CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    body3?: React.CSSProperties;
    cardTitle?: React.CSSProperties;
  }

  interface AlertPriorityColorOptions {
    low: {
      background: string;
      header: string;
      icon?: string;
    };
    medium: {
      background: string;
      header: string;
      icon?: string;
    };
    high: {
      background: string;
      header: string;
      icon?: string;
    };
  }
  interface Palette {
    borders: PaletteColor;
    alerts: AlertPriorityColorOptions;
    links: string;
    activeStatus: string;
  }
  interface PaletteOptions {
    borders: SimplePaletteColorOptions;
    alerts: AlertPriorityColorOptions;
    links: string;
    activeStatus: string;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    body3: true;
    cardTitle: true;
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
      default: '#FCFCFC',
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
      low: {
        background: '#FFFDE0',
        header: '#FFCB52',
      },
      medium: {
        background: '#ED6C020A',
        header: '#FF9900',
      },
      high: {
        background: '#D32F2F26',
        header: '#D32F2F',
        icon: '#FFFFFF8F',
      },
    },
    links: '#1976D2',
    activeStatus: '#75559F',
  },
};

// Create theme options to use for composition
// See: https://mui.com/material-ui/customization/theming/#createtheme-options-args-theme
const createThemeOptions = (theme: Theme) => ({
  typography: {
    h1: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 40,
      fontWeight: 300,
      lineHeight: '43px',
    },
    h2: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 32,
      fontWeight: 400,
      lineHeight: '36px',
    },
    h3: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 24,
      fontWeight: 400,
    },
    h4: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 20,
      fontWeight: 500,
      letterSpacing: '0.25px',
    },
    h5: {
      fontFamily: '"Open Sans", sans-serif',
      fontSize: 18,
      fontWeight: 600,
    },
    h6: {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 14,
    },
    body1: {
      fontFamily: '"Open Sans", sans-serif',
      fontSize: 16,
      fontWeight: 400,
      lineHeight: '24px',
    },
    body2: {
      fontFamily: '"Open Sans", sans-serif',
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '22px',
    },
    body3: {
      // bold body1
      fontWeight: 800,
    },
    button: {
      textTransform: 'none',
    },
    cardTitle: {
      // non-bold version of h5
      fontFamily: '"Open Sans", sans-serif',
      fontSize: 18,
      fontWeight: 400,
    },
    overline: {
      color: '#1976D2',
      fontSize: 12,
    },
  },

  components: {
    MuiTypography: {
      styleOverrides: {
        h3: {
          b: { fontWeight: 500 },
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
          py: '14px',
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
    MuiLink: {
      defaultProps: {
        variant: 'body2',
      },
      styleOverrides: {
        root: theme.unstable_sx({
          color: theme.palette.links,
          textDecorationColor: theme.palette.links,
          textUnderlineOffset: '0.2rem',
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
          whiteSpace: 'nowrap',
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
    MuiAlert: {
      styleOverrides: {
        // override default transparent bg
        outlined: { backgroundColor: '#fff' },
      },
      variants: [
        {
          // styles that are shared across all withHeader alerts
          props: { variant: 'withHeader' },
          style: theme.unstable_sx({
            padding: 0,
            color: 'black',
            '& .MuiAlertTitle-root': {
              padding: theme.spacing(2),
              margin: 0,
              fontWeight: 800,
            },
            '& .MuiAlert-message': {
              padding: 0,
              width: '100%',
            },
            '& .MuiAlert-body': {
              padding: theme.spacing(2),
            },
          }),
        },
        {
          // styles for LOW priority
          props: { variant: 'withHeader', color: 'low' },
          style: theme.unstable_sx({
            borderColor: theme.palette.alerts.low.header,
            backgroundColor: theme.palette.alerts.low.background,
            '& .MuiAlertTitle-root': {
              backgroundColor: theme.palette.alerts.low.header,
              color: theme.palette.getContrastText(
                theme.palette.alerts.low.header
              ),
            },
          }),
        },
        {
          // styles for MEDIUM priority
          props: { variant: 'withHeader', color: 'medium' },
          style: theme.unstable_sx({
            borderColor: theme.palette.alerts.medium.header,
            backgroundColor: theme.palette.alerts.medium.background,
            '& .MuiAlertTitle-root': {
              backgroundColor: theme.palette.alerts.medium.header,
              color: theme.palette.getContrastText(
                theme.palette.alerts.medium.header
              ),
            },
          }),
        },
        {
          // styles for HIGH priority
          props: { variant: 'withHeader', color: 'high' },
          style: theme.unstable_sx({
            borderColor: theme.palette.alerts.high.header,
            backgroundColor: theme.palette.alerts.high.background,
            '& .MuiAlertTitle-root': {
              backgroundColor: theme.palette.alerts.high.header,
              color: theme.palette.getContrastText(
                theme.palette.alerts.high.header
              ),
            },
            '& .MuiAlertTitle-root .MuiIconButton-root': {
              color: theme.palette.alerts.high.icon,
            },
          }),
        },
      ],
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
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
        outlined: {
          backgroundColor: theme.palette.background.paper,
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
