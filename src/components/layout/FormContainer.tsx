import { Box, BoxProps } from '@mui/material';
import { ReactNode, forwardRef } from 'react';

import SaveSlide from '../../modules/form/components/SaveSlide';

interface Props extends BoxProps {
  children: ReactNode;
  hideActions?: boolean;
  saveButtons?: JSX.Element;
  variant?: 'stickyActions' | 'inlineActions';
}

const FormContainer = forwardRef<HTMLElement, Props>(
  (
    {
      hideActions = false,
      saveButtons,
      variant = 'inlineActions',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Box {...props} ref={ref}>
        <Box mb={2}>{children}</Box>
        {variant == 'inlineActions' && saveButtons && !hideActions && (
          <Box sx={{ mt: 3 }}>{saveButtons}</Box>
        )}
        {variant == 'stickyActions' && saveButtons && (
          <SaveSlide in={!hideActions} appear timeout={300} direction='up'>
            {saveButtons}
          </SaveSlide>
        )}
      </Box>
    );
  }
);

export default FormContainer;
