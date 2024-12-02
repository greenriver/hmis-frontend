import { alpha, Box, SvgIconProps } from '@mui/material';
import React from 'react';

const FilePreviewIcon: React.FC<{
  IconComponent: React.ComponentType<SvgIconProps>;
}> = ({ IconComponent }) => (
  <Box
    sx={{
      backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.12),
      lineHeight: 0,
      display: 'inline-flex',
      justifyContent: 'center',
      alignItems: 'center',
      p: 1,
      borderRadius: 100,
      mb: 0.5,
    }}
  >
    <IconComponent color='primary' />
  </Box>
);

export default FilePreviewIcon;
