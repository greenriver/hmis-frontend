import { ThemeOptions } from '@mui/material';

const theme: ThemeOptions = {
  components: {
    MuiDatePicker: {
      defaultProps: {
        inputFormat: 'MM/dd/yyyy',
      },
    },
    MuiLink: {
      defaultProps: {
        variant: 'body2',
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
    },
    MuiButton: {
      defaultProps: {
        variant: 'contained',
        disableElevation: true,
      },
    },
  },
};

export default theme;
