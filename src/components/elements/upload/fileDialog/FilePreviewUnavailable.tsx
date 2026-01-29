import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import { Box, Link, Stack, Typography } from '@mui/material';
import React from 'react';

interface Props {
  url?: string | null;
}
const FilePreviewUnavailable: React.FC<Props> = ({ url }) => {
  return (
    <Box sx={{ my: 4, textAlign: 'center' }}>
      <Box
        sx={{
          fontSize: '3rem',
          textAlign: 'center',
          color: 'text.secondary',
          backgroundColor: 'grey.300',
          display: 'inline-flex',
          padding: 3,
          borderRadius: 1000,
          mb: 2,
        }}
      >
        <ImageNotSupportedIcon fontSize='inherit' color='inherit' />
      </Box>
      <Stack gap={3}>
        <Typography fontSize='2rem' color='text.secondary'>
          No Preview Available
        </Typography>
        {url && (
          <Typography>
            Please{' '}
            <Link href={url} target='_blank' variant='inherit'>
              download the file
            </Link>{' '}
            to view
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default FilePreviewUnavailable;
