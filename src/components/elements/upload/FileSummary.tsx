import { HighlightOff as HighlightOffIcon } from '@mui/icons-material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { Box, Button, Link, Stack, Tooltip, Typography } from '@mui/material';
import React, { ReactNode, useMemo } from 'react';
import FilePreviewIcon from '@/components/elements/upload/FilePreviewIcon';

export type FileSummaryProps = {
  fileName: string;
  url: string;
  showThumbnail?: boolean;
  onRemove?: VoidFunction;
  openPreview?: VoidFunction;
  info?: ReactNode;
  variant: 'row' | 'stacked';
};

const FileSummary: React.FC<FileSummaryProps> = ({
  fileName,
  url,
  onRemove,
  openPreview,
  info,
  variant = 'stacked',
  showThumbnail = false,
}) => {
  const preview = useMemo(
    () => (
      <>
        {showThumbnail ? (
          <Box
            component='img'
            alt='file preview'
            src={url}
            sx={{
              width: '72px',
              height: '72px',
              borderRadius: (theme) => `${theme.shape.borderRadius}px`,
              mb: 1,
            }}
          />
        ) : (
          <FilePreviewIcon IconComponent={InsertDriveFileIcon} />
        )}
      </>
    ),
    [showThumbnail, url]
  );

  if (variant === 'stacked') {
    return (
      <>
        {preview}
        <Box>
          <Typography color='inherit'>{fileName}</Typography>
          {onRemove && (
            <Tooltip title='Clear uploaded file'>
              <Link
                component='button'
                underline='none'
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                variant='body2'
                color='GrayText'
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  mt: 1,
                }}
              >
                <HighlightOffIcon fontSize='inherit' />
                &nbsp;Clear
              </Link>
            </Tooltip>
          )}
        </Box>
      </>
    );
  }

  return (
    <Stack sx={{ p: 1 }} direction='row' justifyContent='space-between'>
      <Stack spacing={1} direction='row' alignItems='center'>
        {preview}
        <Typography variant='body2' color='inherit'>
          {fileName}
        </Typography>
        {info}
      </Stack>
      <Stack spacing={1} direction='row' alignItems='center'>
        {openPreview && (
          <Button variant='text' onClick={openPreview}>
            View
          </Button>
        )}
        <Button component='a' href={url} target='_blank' variant='text'>
          Download
        </Button>
        {onRemove && (
          // It's intentional that we use Delete here in the 'row' variant, vs Clear in the 'stacked' variant
          <Button variant='text' onClick={onRemove}>
            Delete
          </Button>
        )}
      </Stack>
    </Stack>
  );
};

export default FileSummary;
