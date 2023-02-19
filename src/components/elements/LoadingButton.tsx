import { LoadingButton as MuiLoadingButton } from '@mui/lab';
import { ButtonProps } from '@mui/material';
import { forwardRef } from 'react';

/**
 * Wrapper around LoadingButton to make tsc compilation faster.
 *
 * Should be able to remove if this is fixed:
 * https://github.com/mui/material-ui/issues/30038
 */

export interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
  loadingPosition: 'start' | 'end' | 'center';
}

const LoadingButton = forwardRef<LoadingButtonProps, any>((props, ref) => (
  <MuiLoadingButton ref={ref} {...props} />
));

LoadingButton.displayName = 'LoadingButton';

export default LoadingButton;
