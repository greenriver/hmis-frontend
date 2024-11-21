import { LoadingButton as MuiLoadingButton } from '@mui/lab';
import { ButtonProps } from '@mui/material';
import { forwardRef, useMemo } from 'react';

/**
 * Wrapper around LoadingButton to make tsc compilation faster.
 *
 * Should be able to remove if this is fixed:
 * https://github.com/mui/material-ui/issues/30038
 */

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingPosition?: 'start' | 'end' | 'center';
}

const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  function LoadingButton(
    { loadingPosition = 'start', loading = false, ...props },
    ref
  ) {
    const extraSx = useMemo(() => {
      if (loading && loadingPosition === 'start') {
        return { pl: 5 };
      }
      if (loading && loadingPosition === 'end') {
        return { pr: 5 };
      }
      return;
    }, [loading, loadingPosition]);

    return (
      // Known issue - this causes a console warning,
      // 'Failed prop type: MUI: The loadingPosition="start" should be used in combination with startIcon.'
      // https://github.com/mui/material-ui/issues/31235
      <MuiLoadingButton
        ref={ref}
        loadingPosition={loadingPosition}
        loading={loading}
        {...props}
        sx={{ ...props.sx, ...extraSx }}
      />
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

export default LoadingButton;
