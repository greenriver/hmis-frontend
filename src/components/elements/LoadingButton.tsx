import { LoadingButton as MuiLoadingButton } from '@mui/lab';
import { ButtonProps } from '@mui/material';
import { forwardRef, Ref, useMemo } from 'react';

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
    {
      loadingPosition = 'start',
      loading = false,
      ...props
    }: LoadingButtonProps,
    ref: Ref<HTMLButtonElement>
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
      <MuiLoadingButton ref={ref} {...props} sx={{ ...props.sx, ...extraSx }} />
    );
  }
);

LoadingButton.displayName = 'LoadingButton';

export default LoadingButton;
