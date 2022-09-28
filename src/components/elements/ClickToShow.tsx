import VisibilityIcon from '@mui/icons-material/Visibility';
import { Link, Stack, Typography, TypographyProps } from '@mui/material';
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
    <Link
      sx={{ textDecoration: 'none', color: 'text.disabled' }}
      onClick={() => setHidden(false)}
    >
      <Stack direction='row' alignItems='center' gap={0.8}>
        <VisibilityIcon color='disabled' fontSize='small' />
        <Typography {...props} sx={{ textDecoration: 'none', ...props.sx }}>
          {text}
        </Typography>
      </Stack>
    </Link>
  );
};

export default ClickToShow;
