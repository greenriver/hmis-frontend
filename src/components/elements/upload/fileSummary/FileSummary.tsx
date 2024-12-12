import { HighlightOff as HighlightOffIcon } from '@mui/icons-material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { Box, Link, Stack, Tooltip, Typography } from '@mui/material';
import React, { ReactNode, useMemo } from 'react';
import CommonMenuButton from '@/components/elements/CommonMenuButton';
import FilePreviewIcon from '@/components/elements/upload/FilePreviewIcon';

export type FileSummaryProps = {
  fileName: string;
  url: string;
  showThumbnail?: boolean;
  permitDownload?: boolean;
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
  permitDownload = true,
}) => {
  const preview = useMemo(() => {
    // For the "row" variant, make the preview the same size as the FilePreviewIcon, so row heights are the same
    const size = variant === 'row' ? '40px' : '72px';
    return (
      <>
        {showThumbnail ? (
          <Box
            component='img'
            alt='file preview'
            src={url}
            sx={{
              width: size,
              height: size,
              borderRadius: (theme) => `${theme.shape.borderRadius}px`,
              mb: 1,
            }}
          />
        ) : (
          <FilePreviewIcon IconComponent={InsertDriveFileIcon} />
        )}
      </>
    );
  }, [showThumbnail, url, variant]);

  const menuItems = useMemo(
    () => [
      ...(openPreview
        ? [
            {
              key: 'View',
              title: 'View',
              onClick: openPreview,
              ariaLabel: `View ${fileName}`,
            },
          ]
        : []),
      ...(permitDownload
        ? [
            {
              key: 'Download',
              title: 'Download',
              to: url,
              ariaLabel: `Download ${fileName}`,
            },
          ]
        : []),
      // It's intentional that we use Delete here in the 'row' variant, vs Clear in the 'stacked' variant
      ...(onRemove
        ? [
            {
              key: 'Delete',
              title: 'Delete',
              onClick: onRemove,
              ariaLabel: `Delete ${fileName}`,
            },
          ]
        : []),
    ],
    [onRemove, openPreview, permitDownload, url, fileName]
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
      {menuItems.length && (
        <CommonMenuButton
          iconButton
          title='File Actions'
          items={menuItems}
          ButtonProps={{ 'aria-label': `File Actions for ${fileName}` }}
        />
      )}
    </Stack>
  );
};

export default FileSummary;
