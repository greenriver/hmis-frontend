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
  previewUrl?: string;
  onRemove?: VoidFunction;
  openPreview?: VoidFunction;
  info?: ReactNode;
  variant: 'row' | 'stacked';
};

const FileSummary: React.FC<FileSummaryProps> = ({
  fileName,
  previewUrl,
  onRemove,
  openPreview,
  info,
  variant = 'stacked',
}) => {
  const preview = useMemo(
    () => (
      <>
        {previewUrl ? (
          <Box
            component='img'
            alt='file preview'
            src={previewUrl}
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
    [previewUrl]
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
        <Button // todo @Martha - download often doesn't work for existing files! maybe it expires? we can't have everything
          component='a'
          href={previewUrl || ''} // todo @martha! preview url is blank if we don't want to preview, but we should always send it.
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
  const previewUrl = useMemo(
    () => (file.type.match(/^image/) ? URL.createObjectURL(file) : undefined),
    [file]
  );
  // const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <FileSummary
        fileName={file.name}
        previewUrl={previewUrl}
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
        // openPreview={() => setPreviewOpen(true)}
      />
      {/* todo @martha - add ability to preview unsaved file  */}
      {/*<FileDialog*/}
      {/*  open={previewOpen}*/}
      {/*  onClose={() => setPreviewOpen(false)}*/}
      {/*  file={file}*/}
      {/*/>*/}
    </>
  );
};

export const ExistingFileSummary: React.FC<{
  file: FileFieldsFragment;
  variant: FileSummaryProps['variant'];
  onRemove?: FileSummaryProps['onRemove'];
}> = ({ file, variant, onRemove }) => {
  const previewUrl = useMemo(
    () =>
      file.contentType && file.contentType.match(/^image/)
        ? file.url || undefined
        : undefined,
    [file]
  );
  const date = parseHmisDateString(file.dateCreated);
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <FileSummary
        fileName={file.name}
        previewUrl={previewUrl}
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
