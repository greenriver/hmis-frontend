import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Button, Stack, Typography, TypographyProps } from '@mui/material';
import { isNil } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export interface Props extends TypographyProps {
  children: React.ReactNode;
  text?: string;
  // Use these to control the component from without
  hide?: boolean | null;
  onToggle?: (val?: boolean) => any;
  hiddenAriaLabel?: string;
  shownAriaLabel?: string;
}

const ClickToShow: React.FC<Props> = ({
  children,
  text = 'Hidden',
  hide,
  onToggle: onToggleProp,
  hiddenAriaLabel,
  shownAriaLabel,
  ...props
}) => {
  const [hiddenState, setHiddenState] = useState(true);

  const hidden = useMemo(
    () => (isNil(hide) ? hiddenState : hide),
    [hiddenState, hide]
  );
  const onToggle = useCallback(() => {
    if (onToggleProp) onToggleProp(!hidden);
    if (isNil(hide)) setHiddenState((prev) => !prev);
  }, [hidden, onToggleProp, hide]);

  useEffect(() => {
    if (!isNil(hide)) setHiddenState(!hide);
  }, [hide]);

  const ariaLabel = useMemo(() => {
    if (hidden && hiddenAriaLabel) return hiddenAriaLabel;
    if (!hidden && shownAriaLabel) return shownAriaLabel;
  }, [hiddenAriaLabel, shownAriaLabel, hidden]);

  return (
    <Button
      variant='text'
      // Unintuitively, aria-live="off" means to announce changes only when this element has focus.
      // (See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
      // This prevents all hidden items in a column from announcing changes when the show/hide button in the column header is clicked.
      aria-live='off'
      aria-label={ariaLabel}
      sx={(theme) => ({
        textDecoration: 'none',
        userSelect: 'text',
        // color: hidden ? 'text.disabled' : 'text.primary',
        justifyContent: 'flex-start',
        width: 'fit-content',
        textAlign: 'left',
        color: hidden ? 'text.disabled' : theme.palette.links,
        p: 0,
      })}
      onClick={onToggle}
      size='small'
      data-testid='clickToShow'
    >
      <Stack direction='row' alignItems='center' gap={0.8}>
        {hidden ? (
          <VisibilityOffIcon color='disabled' fontSize='small' />
        ) : (
          <VisibilityIcon
            sx={(theme) => ({ color: theme.palette.links })}
            fontSize='small'
          />
        )}
        {hidden ? (
          <Typography {...props} sx={{ textDecoration: 'none', ...props.sx }}>
            {text}
          </Typography>
        ) : (
          <>{children}</>
        )}
      </Stack>
    </Button>
  );
};

export default ClickToShow;
