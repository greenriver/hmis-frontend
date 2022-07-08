import { ThemeOptions } from '@mui/material';

const theme: ThemeOptions = {
  components: {
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
    MuiButton: {
      defaultProps: {
        variant: 'contained',
        disableElevation: true,
      },
    },
  },
};

export default theme;
