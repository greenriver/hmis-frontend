import VisibilityIcon from '@mui/icons-material/Visibility';
import { Button, Stack, Typography, TypographyProps } from '@mui/material';
import React, { useState } from 'react';
interface Props extends TypographyProps {
  children: React.ReactNode;
  text?: string;
}

const ClickToShow: React.FC<Props> = ({
  children,
  text = 'Click to Show',
  ...props
}) => {
  const [hidden, setHidden] = useState(true);
  if (!hidden) return <>{children}</>;

  return (
    <Button
      variant='text'
      sx={{
        textDecoration: 'none',
        color: 'text.disabled',
        justifyContent: 'flex-start',
        width: 'fit-content',
        // userSelect: 'text',
        p: 0,
      }}
      onClick={() => setHidden(false)}
      size='small'
    >
      <Stack direction='row' alignItems='center' gap={0.8}>
        <VisibilityIcon color='disabled' fontSize='small' />
        <Typography {...props} sx={{ textDecoration: 'none', ...props.sx }}>
          {text}
        </Typography>
      </Stack>
    </Button>
  );
};

export default ClickToShow;
