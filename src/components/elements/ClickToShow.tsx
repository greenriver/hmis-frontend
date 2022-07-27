import VisibilityIcon from '@mui/icons-material/Visibility';
import { Stack, Link, Typography } from '@mui/material';
import React, { useState } from 'react';
interface Props {
  children: React.ReactNode;
  text?: string;
}

const ClickToShow: React.FC<Props> = ({ children, text = 'Click to Show' }) => {
  const [hidden, setHidden] = useState(true);
  if (!hidden) return <>{children}</>;
  return (
    <Link
      sx={{ textDecoration: 'none', color: 'text.disabled' }}
      onClick={() => setHidden(false)}
    >
      <Stack direction='row' alignItems='center' gap={0.8}>
        <VisibilityIcon color='disabled' fontSize='small' />
        <Typography sx={{ textDecoration: 'none' }}>{text}</Typography>
      </Stack>
    </Link>
  );
};

export default ClickToShow;
