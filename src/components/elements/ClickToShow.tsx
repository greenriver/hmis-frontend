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
}

const ClickToShow: React.FC<Props> = ({
  children,
  text = 'Hidden',
  hide,
  onToggle: onToggleProp,
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

  return (
    <Button
      variant='text'
      aria-label={text}
      sx={{
        textDecoration: 'none',
        color: hidden ? 'text.disabled' : 'text.primary',
        justifyContent: 'flex-start',
        width: 'fit-content',
        textAlign: 'left',
        // userSelect: 'text',
        p: 0,
      }}
      onClick={onToggle}
      size='small'
    >
      <Stack direction='row' alignItems='center' gap={0.8}>
        {hidden ? (
          <VisibilityOffIcon color='disabled' fontSize='small' />
        ) : (
          <VisibilityIcon color='primary' fontSize='small' />
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
