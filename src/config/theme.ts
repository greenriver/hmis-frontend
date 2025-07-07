import { Theme } from '@mui/material';
import {
  PaletteColor,
  SxProps,
  ThemeOptions,
  alpha,
  createTheme,
} from '@mui/material/styles';
import { deepmerge, visuallyHidden } from '@mui/utils';

declare module '@mui/material/Alert' {
  interface AlertPropsVariantOverrides {
    withHeader: true;
  }
  interface AlertPropsColorOverrides {
    low: true;
    medium: true;
    high: true;
    primary: true;
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
    activeStatus: string;
    grayscale: SimplePaletteColorOptions;
  }

  interface PaletteOptions {
    borders: SimplePaletteColorOptions;
    alerts: AlertPriorityColorOptions;
    activeStatus: string;
    grayscale: SimplePaletteColorOptions;
  }

  interface SimplePaletteColorOptions {
    surface?: string;
    darkest?: string;
    100?: string;
    200?: string;
    300?: string;
  }
}

// Extend the SimplePaletteColorOptions
declare module '@mui/material/styles/createPalette' {
  interface SimplePaletteColorOptions {
    surface?: string;
    darkest?: string;
    100?: string;
    200?: string;
    300?: string;
  }
  interface PaletteColor {
    surface: string;
    darkest?: string;
    100: string;
    200: string;
    300: string;
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

declare module '@mui/material/IconButton' {
  interface IconButtonPropsColorOverrides {
    grayscale: true;
  }
}

declare module '@mui/material/Chip' {
  interface ChipPropsVariantOverrides {
    status: true;
  }
  interface ChipPropsColorOverrides {
    grayscale: true;
  }
}

const generateShades = (mainColor: string) => ({
  100: alpha(mainColor, 0.08),
  200: alpha(mainColor, 0.12),
  300: alpha(mainColor, 0.3),
});

// Default base theme, to be merged with overlays
export const baseThemeOptions = {
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
      surface: '#F8F9FB',
      light: '#A4B9DB',
      main: '#5661A5',
      dark: '#1D2877',
      darkest: '#17205F',
      contrastText: '#FFFFFF',
    },
    success: {
      surface: '#F1F9F1',
      light: '#6FBF73',
      main: '#4CAF50',
      dark: '#357A38',
      darkest: '#263826',
      contrastText: '#263826',
    },
    warning: {
      surface: '#FEF3EB',
      light: '#FF9800',
      main: '#ED6C02',
      dark: '#D14900',
      darkest: '#4D1800',
      contrastText: '#4D1800',
    },
    error: {
      surface: '#FEF0EF',
      light: '#F6685E',
      main: '#F44336',
      dark: '#AA2E25',
      darkest: '#420400',
      contrastText: '#420400',
    },
    background: {
      default: '#FCFCFC',
    },
    secondary: {
      main: '#75559F', // TODO: remove
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
    activeStatus: '#75559F',
    grayscale: {
      main: '#6E6E6E', // MUI's default text.disabled doesn't meet contrast requirements and should never be used for non-disabled text elements. Use grayscale.main instead
      dark: '#4D4D4D',
      light: '#8b8b8b',
      contrastText: '#fff',
      surface: '#F3F3F3',
    },
  },
} as const satisfies ThemeOptions;

const outlineStyles = {
  outlineColor: '-webkit-focus-ring-color',
  outlineWidth: '2px',
  outlineStyle: 'auto',
};

// Add shades to palette as a separate step, rather than in baseThemeOptions, so that they are
// generated based on the final palette values (which may be overridden by GrdaWarehouse::Theme customizations)
const addPaletteShades = (theme: Theme) =>
  createTheme(theme, {
    palette: {
      primary: { ...generateShades(theme.palette.primary.main) },
      success: { ...generateShades(theme.palette.success.main) },
      warning: { ...generateShades(theme.palette.warning.main) },
      error: { ...generateShades(theme.palette.error.main) },
      grayscale: { ...generateShades(theme.palette.grayscale.main) },
    },
  });

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
    MuiCssBaseline: {
      styleOverrides: {
        '&.Mui-focusVisible': outlineStyles,
      },
    },
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
          color: 'primary.dark',
          textUnderlineOffset: '0.2rem',
          cursor: 'pointer',
          '&.Mui-focusVisible': {
            outlineOffset: '4px',
          },
        }),
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: theme.unstable_sx({
          '&.Mui-focusVisible': {
            outlineOffset: 0,
            backgroundColor: 'grayscale.200',
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
            backgroundColor: 'grayscale.surface',
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
          '&.Mui-error': {
            color: 'error.dark',
          },
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
            ...outlineStyles,
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
            ...outlineStyles,
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
    MuiSnackbar: {
      styleOverrides: {
        root: theme.unstable_sx({
          boxShadow: theme.shadows[4],
          borderRadius: 2,
        }),
      },
    },
    MuiChip: {
      variants: [
        {
          props: { variant: 'status' },
          style: ({
            theme,
            ownerState,
          }: {
            theme: Theme;
            ownerState: {
              color?: 'primary' | 'warning' | 'success' | 'grayscale';
            };
          }) => {
            const paletteColor = ownerState.color
              ? theme.palette[ownerState.color]
              : undefined;

            let color;
            let backgroundColor;
            let iconColor;

            if (!paletteColor) {
              color = theme.palette.text.primary;
              iconColor = theme.palette.text.secondary;
              backgroundColor = theme.palette.grayscale.surface;
            } else if (ownerState.color === 'grayscale') {
              color = paletteColor.main;
              iconColor = paletteColor.light;
              backgroundColor = paletteColor.surface;
            } else {
              color = paletteColor.darkest;
              iconColor = paletteColor.main;
              backgroundColor = paletteColor.surface;
            }

            return {
              fontWeight: 600,
              fontSize: '14px',
              border: 'none',
              backgroundColor: backgroundColor,
              color: color,
              '& .MuiChip-icon': {
                color: iconColor,
              },
            };
          },
        },
      ],
    },
    MuiAlert: {
      styleOverrides: {
        // override default transparent bg
        outlined: { backgroundColor: '#fff' },
      },
      variants: [
        {
          props: { color: 'primary' },
          style: theme.unstable_sx({
            borderColor: 'primary.300',
            backgroundColor: 'primary.surface',
            color: 'text.primary',
          }),
        },
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
            '&:not(:disabled, .Mui-disabled) .MuiButton-icon': {
              color: 'grayscale.main',
            },
            '&.MuiButton-contained': {
              backgroundColor: 'grayscale.100',
              '&:hover': {
                backgroundColor: 'grayscale.200',
              },
            },
            '&.MuiButton-text:hover': {
              backgroundColor: 'grayscale.100',
            },
            '&.MuiButton-outlined': {
              borderColor: 'grayscale.300',
            },
          }),
        },
      ],
      styleOverrides: {
        root: theme.unstable_sx({
          fontWeight: 600,
          '&.MuiButton-contained.Mui-disabled': {
            backgroundColor: 'grayscale.200',
          },
          // Contained Warning and Primary use 'light' for bg instead of usual 'main'
          '&.MuiButton-contained.MuiButton-colorWarning:not(:disabled, .Mui-disabled)':
            {
              backgroundColor: 'warning.light',
              '&:hover': { backgroundColor: 'warning.main' },
            },
          '&.MuiButton-contained.MuiButton-colorError:not(:disabled, .Mui-disabled)':
            {
              backgroundColor: 'error.light',
              '&:hover': { backgroundColor: 'error.main' },
            },
          '&.MuiButton-contained.MuiButton-colorSuccess:not(:disabled, .Mui-disabled)':
            {
              backgroundColor: 'success.light',
              '&:hover': { backgroundColor: 'success.main' },
            },
          // Overrides to make all `text buttons use 12% opacity instead of 4%
          '&.MuiButton-text.MuiButton-colorPrimary:hover': {
            backgroundColor: 'primary.200',
          },
          '&.MuiButton-text.MuiButton-colorSecondary:hover': {
            backgroundColor: 'secondary.200',
          },
          '&.MuiButton-text.MuiButton-colorWarning:hover': {
            backgroundColor: 'warning.200',
          },
          '&.MuiButton-text.MuiButton-colorError:hover': {
            backgroundColor: 'error.200',
          },
          '&.MuiButton-text.MuiButton-colorSuccess:hover': {
            backgroundColor: 'success.200',
          },
          // Overrides to make all `outlined` buttons use dark text
          '&.MuiButton-outlined.MuiButton-colorPrimary:not(:disabled, .Mui-disabled)':
            {
              color: 'primary.dark',
            },
          '&.MuiButton-outlined.MuiButton-colorWarning:not(:disabled, .Mui-disabled)':
            {
              color: 'warning.dark',
            },
          '&.MuiButton-outlined.MuiButton-colorError:not(:disabled, .Mui-disabled)':
            {
              color: 'error.dark',
            },
          '&.MuiButton-outlined.MuiButton-colorSuccess:not(:disabled, .Mui-disabled)':
            {
              color: 'success.dark',
            },
          // Overrides to make all `text` buttons use dark text
          '&.MuiButton-text.MuiButton-colorPrimary:not(:disabled, .Mui-disabled)':
            {
              color: 'primary.dark',
            },
          '&.MuiButton-text.MuiButton-colorWarning:not(:disabled, .Mui-disabled)':
            {
              color: 'warning.dark',
            },
          '&.MuiButton-text.MuiButton-colorError:not(:disabled, .Mui-disabled)':
            {
              color: 'error.dark',
            },
          '&.MuiButton-text.MuiButton-colorSuccess:not(:disabled, .Mui-disabled)':
            {
              color: 'success.dark',
            },
          // Overrides to make all `outlined` buttons use 12% opacity instead of 4%
          '&.MuiButton-outlined.MuiButton-colorPrimary:hover': {
            backgroundColor: 'primary.200',
            borderColor: 'primary.300',
          },
          '&.MuiButton-outlined.MuiButton-colorWarning:hover': {
            backgroundColor: 'warning.200',
            borderColor: 'warning.300',
          },
          '&.MuiButton-outlined.MuiButton-colorError:hover': {
            backgroundColor: 'error.200',
            borderColor: 'error.300',
          },
          '&.MuiButton-outlined.MuiButton-colorSuccess:hover': {
            backgroundColor: 'success.200',
            borderColor: 'success.300',
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
          '&.Mui-disabled': theme.unstable_sx({
            opacity: 1,
            color: 'grayscale.main',
          }),
          '&.Mui-error': theme.unstable_sx({
            opacity: 1,
            color: 'error.dark',
          }),
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
  // Create the base theme, merged with any overlays from the backend
  // (Note: if overlaying a color, need to specify all main/surface/dark/darkest values.
  //  we don't currently calculate those based off primary)
  const theme = createTheme(deepmerge(baseThemeOptions, options || {}));
  // Add missing shades to the palette
  const themeWithShades = addPaletteShades(theme);
  // Create the full theme with composition
  return createTheme(themeWithShades, createThemeOptions(themeWithShades));
};

// Export default theme with no overlay options
export default createFullTheme();

// MUI's visuallyHidden sometimes takes up space and otherwise causes visual bugs,
// so we override it here with our own version that sets position to `fixed`
export const customVisuallyHidden: SxProps = {
  ...visuallyHidden,
  position: 'fixed',
};
