import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link, LinkProps, Typography } from '@mui/material';
import React from 'react';

const ExternalLink: React.FC<LinkProps> = ({ children, ...props }) => {
  return (
    <Link target='_blank' {...props}>
      <Typography
        variant='inherit'
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}
      >
        {children} <OpenInNewIcon fontSize='inherit' />
      </Typography>
    </Link>
  );
};

export default ExternalLink;
