import { Box, SvgIconProps } from '@mui/material';
import React from 'react';
import { OpenInNewIcon } from '@/components/elements/SemanticIcons';
import { customVisuallyHidden } from '@/config/theme';

/**
 * OpenInNewIcon with visually hidden "(opens in new tab)" text for accessibility.
 * Use wherever a link or button opens in a new tab.
 */
const NewTabIcon: React.FC<SvgIconProps> = (props) => (
  <>
    <OpenInNewIcon fontSize='inherit' {...props} />
    <Box component='span' sx={customVisuallyHidden}>
      {' '}
      (opens in new tab)
    </Box>
  </>
);

export default NewTabIcon;
