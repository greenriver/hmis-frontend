import { Color, Theme } from '@mui/material';
import {
  PaletteColor,
  SimplePaletteColorOptions,
  ThemeOptions,
  alpha,
  createTheme,
} from '@mui/material/styles';
import { deepmerge } from '@mui/utils';

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
  interface GrayscalePaletteColor
    extends PaletteColor,
      Pick<Color, 300 | 200 | 100> {
    tint: string;
  }

  interface Palette {
    borders: PaletteColor;
    alerts: AlertPriorityColorOptions;
    links: string;
    activeStatus: string;
    grayscale: GrayscalePaletteColor;
  }

  interface PaletteOptions {
    borders: SimplePaletteColorOptions;
    alerts: AlertPriorityColorOptions;
    links: string;
    activeStatus: string;
    grayscale: SimplePaletteColorOptions & GrayscalePaletteColor;
  }
}

// Extend the SimplePaletteColorOptions type to include a 'text' field
declare module '@mui/material/styles/createPalette' {
  interface SimplePaletteColorOptions {
    text?: string;
  }
  interface PaletteColor {
    text?: string;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    body3: true;
    cardTitle: true;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    grayscale: true;
  }
}

// Default base theme, to be merged with overlays
export const baseThemeDef: ThemeOptions = {
  typography: {
    fontFamily: '"Open Sans", sans-serif',
    fontWeightBold: 600,
  },
  breakpoints: {
    values: {
      xs: 0, // MUI default
      sm: 600, // MUI default
      md: 768, // Custom (Tablet) - MUI default is 900
      lg: 1200, // MUI default
      xl: 1536, // MUI default
    },
  },
  palette: {
    primary: {
      main: '#5661A5',
      text: '#17205F',
      dark: '#1D2877',
      light: '#A4B9DB',
    },
    success: {
      main: '#4CAF50',
      text: '#2A622D',
      dark: '#357A38',
      light: '#6FBF73',
      contrastText: '#fff',
    },
    warning: {
      main: '#ED6C02',
      text: '#A13900',
      dark: '#E65100',
      light: '#FF9800',
    },
    background: {
      default: '#FCFCFC',
    },
    secondary: {
      main: '#75559F', // REMOVE
    },
    error: {
      main: '#F44336',
      text: '#88251E',
      dark: '#AA2E25',
      light: '#F6685E',
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
    // TODO: what is guidance around using `gray[]` color palette? should we avoid?
    grayscale: {
      main: '#6E6E6E',
      dark: '#4D4D4D',
      light: '#8b8b8b',
      contrastText: '#fff',
      tint: '#F3F3F3',
      300: alpha('#6E6E6E', 0.3),
      200: alpha('#6E6E6E', 0.12),
      100: alpha('#6E6E6E', 0.08),
    },
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
            backgroundColor: theme.palette.grayscale.tint,
          },
        }),
        input: {
          '&::placeholder': {
            opacity: 0.6,
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: theme.unstable_sx({
          typography: 'body2',
          fontWeight: 600,
        }),
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: theme.unstable_sx({
          typography: 'body2',
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
          // Special styles for grayscale button
          props: { color: 'grayscale' },
          style: theme.unstable_sx({
            color: 'text.primary',
            '&:not(:disabled) .MuiButton-icon': {
              color: theme.palette.grayscale.main,
            },
            '&.MuiButton-contained': {
              backgroundColor: theme.palette.grayscale[100],
              '&:hover': {
                backgroundColor: theme.palette.grayscale[200],
              },
            },
            '&.MuiButton-text:hover': {
              backgroundColor: theme.palette.grayscale[100],
            },
            '&.MuiButton-outlined': {
              borderColor: theme.palette.grayscale[300],
            },
          }),
        },
      ],
      styleOverrides: {
        root: theme.unstable_sx({
          fontWeight: 600,
          // Overrides to make all `text` buttons use text color
          '&.MuiButton-text.MuiButton-colorPrimary:not(:disabled)': {
            color: theme.palette.primary.text,
          },
          '&.MuiButton-text.MuiButton-colorSecondary:not(:disabled)': {
            color: theme.palette.secondary.text,
          },
          '&.MuiButton-text.MuiButton-colorWarning:not(:disabled)': {
            color: theme.palette.warning.text,
          },
          '&.MuiButton-text.MuiButton-colorError:not(:disabled)': {
            color: theme.palette.error.text,
          },
          '&.MuiButton-text.MuiButton-colorSuccess:not(:disabled)': {
            color: theme.palette.success.text,
          },
          // Overrides to make all `outlined` buttons use text color
          '&.MuiButton-outlined.MuiButton-colorPrimary:not(:disabled)': {
            color: theme.palette.primary.text,
          },
          '&.MuiButton-outlined.MuiButton-colorSecondary:not(:disabled)': {
            color: theme.palette.secondary.text,
          },
          '&.MuiButton-outlined.MuiButton-colorWarning:not(:disabled)': {
            color: theme.palette.warning.text,
          },
          '&.MuiButton-outlined.MuiButton-colorError:not(:disabled)': {
            color: theme.palette.error.text,
          },
          '&.MuiButton-outlined.MuiButton-colorSuccess:not(:disabled)': {
            color: theme.palette.success.text,
          },
          // Overrides to make all `text buttons use 12% opacity instead of 4%
          '&.MuiButton-text.MuiButton-colorPrimary:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
          },
          '&.MuiButton-text.MuiButton-colorSecondary:hover': {
            backgroundColor: alpha(theme.palette.secondary.main, 0.12),
          },
          '&.MuiButton-text.MuiButton-colorWarning:hover': {
            backgroundColor: alpha(theme.palette.warning.main, 0.12),
          },
          '&.MuiButton-text.MuiButton-colorError:hover': {
            backgroundColor: alpha(theme.palette.error.main, 0.12),
          },
          '&.MuiButton-text.MuiButton-colorSuccess:hover': {
            backgroundColor: alpha(theme.palette.success.main, 0.12),
          },
          // Overrides to make all `outlined` buttons use 12% opacity instead of 4%
          '&.MuiButton-outlined.MuiButton-colorPrimary:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
          },
          '&.MuiButton-outlined.MuiButton-colorSecondary:hover': {
            backgroundColor: alpha(theme.palette.secondary.main, 0.12),
          },
          '&.MuiButton-outlined.MuiButton-colorWarning:hover': {
            backgroundColor: alpha(theme.palette.warning.main, 0.12),
          },
          '&.MuiButton-outlined.MuiButton-colorError:hover': {
            backgroundColor: alpha(theme.palette.error.main, 0.12),
          },
          '&.MuiButton-outlined.MuiButton-colorSuccess:hover': {
            backgroundColor: alpha(theme.palette.success.main, 0.12),
          },
        }),
        // Give 'text' variant Buttons the same horiztonal padding as outlined
        text: theme.unstable_sx({ px: 2 }),
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
    MuiTreeItem2: {
      styleOverrides: {
        root: {
          '.MuiTreeItem-groupTransition': {
            marginLeft: 15,
            paddingLeft: 18,
            borderLeft: `1px solid ${theme.palette.borders.dark}`,
          },
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
