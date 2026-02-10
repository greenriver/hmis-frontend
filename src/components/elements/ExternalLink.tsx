import { Link, LinkProps, Typography } from '@mui/material';
import React from 'react';
import NewTabIcon from '@/components/elements/NewTabIcon';

const ExternalLink: React.FC<LinkProps> = ({ children, ...props }) => {
  return (
    <Link target='_blank' {...props}>
      <Typography
        variant='inherit'
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.75,
          textDecoration: 'inherit',
        }}
      >
        {children} <NewTabIcon />
      </Typography>
    </Link>
  );
};

export default ExternalLink;
