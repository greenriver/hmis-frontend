import { Box, BoxProps } from '@mui/material';
import { ReactNode, forwardRef, useRef } from 'react';

import SaveSlide from '../../modules/form/components/SaveSlide';
import useElementInView from '@/hooks/useElementInView';

export type FormActionStickyType = 'always' | 'never' | 'auto';
interface Props extends BoxProps {
  children: ReactNode;
  hideActions?: boolean;
  actions?: JSX.Element;
  sticky?: FormActionStickyType;
}

const FormContainer = forwardRef<HTMLElement, Props>(
  (
    { hideActions = false, actions, children, sticky = 'auto', ...props },
    ref
  ) => {
    const actionsRef = useRef<HTMLDivElement>();
    const isSaveButtonVisible = useElementInView(actionsRef, '200px');

    if (!actions) {
      return (
        <Box {...props} ref={ref}>
          <Box mb={2}>{children}</Box>
        </Box>
      );
    }

    return (
      <Box {...props} ref={ref}>
        <Box mb={2}>{children}</Box>
        {sticky === 'auto' && !hideActions && (
          <Box ref={actionsRef}>{actions}</Box>
        )}
        {sticky !== 'never' && (
          <SaveSlide
            in={!isSaveButtonVisible || sticky === 'always'}
            appear
            timeout={300}
            direction='up'
          >
            {actions}
          </SaveSlide>
        )}
      </Box>
    );
  }
);

export default FormContainer;
