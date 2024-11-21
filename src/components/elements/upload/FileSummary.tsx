import { HighlightOff as HighlightOffIcon } from '@mui/icons-material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import {
  alpha,
  Box,
  Button,
  Link,
  Stack,
  SvgIconProps,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { ReactNode, useMemo, useState } from 'react';
import theme from '@/config/theme';
import FileDialog from '@/modules/clientFiles/components/FileModal';
import {
  formatRelativeDate,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { FileFieldsFragment } from '@/types/gqlTypes';

export const FilePreviewIcon: React.FC<{
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

type FileSummaryProps = {
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
        <Button // todo @Martha - download and preview sometimes doesn't work for existing files! IT IS PROBABLY BOTH FOR THE SAME REASON! PROBABLY BECAUSE IT EXPIRES!
          component='a'
          href={url}
          target='_blank'
          variant='text'
        >
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

// todo @Martha comments
export const CurrentFileSummary: React.FC<{
  file: File;
  variant: FileSummaryProps['variant'];
  onRemove?: FileSummaryProps['onRemove'];
}> = ({ file, variant, onRemove }) => {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <FileSummary
        fileName={file.name}
        showThumbnail={!!file.type.match(/^image/)}
        url={url}
        info={
          <Typography
            variant='body2'
            sx={{ color: theme.palette.warning.main }}
          >
            (unsaved)
          </Typography>
        }
        variant={variant}
        onRemove={onRemove}
        openPreview={() => setPreviewOpen(true)}
      />
      <FileDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        file={{
          url: url,
          contentType: file.type,
          name: file.name,
        }}
      />
    </>
  );
};

export const ExistingFileSummary: React.FC<{
  file: FileFieldsFragment;
  variant: FileSummaryProps['variant'];
  onRemove?: FileSummaryProps['onRemove'];
}> = ({ file, variant, onRemove }) => {
  const date = parseHmisDateString(file.dateCreated);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <FileSummary
        fileName={file.name}
        showThumbnail={Boolean(
          file.contentType && !!file.contentType.match(/^image/)
        )}
        url={file.url || ''}
        info={
          date && (
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Uploaded {formatRelativeDate(date)}
            </Typography>
          )
        }
        variant={variant}
        onRemove={onRemove}
        openPreview={() => setPreviewOpen(true)}
      />
      <FileDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        file={file}
      />
    </>
  );
};

export default FileSummary;
