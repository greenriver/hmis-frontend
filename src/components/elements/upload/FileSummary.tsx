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
import React, { ReactNode, useMemo } from 'react';
import theme from '@/config/theme';
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
  handleRemove?: VoidFunction;
  info?: ReactNode;
  variant: 'row' | 'stacked';
};

const FileSummary: React.FC<FileSummaryProps> = ({
  fileName,
  previewUrl,
  handleRemove,
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

  // const [previewOpen, setPreviewOpen] = useState(false);

  if (variant === 'stacked') {
    return (
      <>
        {preview}
        <Box>
          <Typography color='inherit'>{fileName}</Typography>
          {handleRemove && (
            <Tooltip title='Clear uploaded file'>
              <Link
                component='button'
                underline='none'
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
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
        {/* todo @Martha good luck lol */}
        {/* <FileDialog
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          file={viewingFile}
          actions={
            <FileActions
              clientId={clientId}
              file={viewingFile}
              onDone={() => setPreviewOpen(false)}
            />
          }
        /> */}
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
        <Button variant='text' onClick={() => {}}>
          View
        </Button>
        <Button variant='text' onClick={() => {}}>
          Download
        </Button>
        {handleRemove && (
          // It's intentional that we use Delete here in the 'row' variant, vs Clear in the 'stacked' variant
          <Button variant='text' onClick={handleRemove}>
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
  handleRemove?: FileSummaryProps['handleRemove'];
}> = ({ file, variant, handleRemove }) => {
  const previewUrl = useMemo(
    () => (file.type.match(/^image/) ? URL.createObjectURL(file) : undefined),
    [file]
  );

  return (
    <FileSummary
      fileName={file.name}
      previewUrl={previewUrl}
      info={
        <Typography variant='body2' sx={{ color: theme.palette.warning.main }}>
          (unsaved)
        </Typography>
      }
      variant={variant}
      handleRemove={handleRemove}
    />
  );
};

export const ExistingFileSummary: React.FC<{
  file: FileFieldsFragment;
  variant: FileSummaryProps['variant'];
  handleRemove?: FileSummaryProps['handleRemove'];
}> = ({ file, variant, handleRemove }) => {
  const previewUrl = useMemo(
    () =>
      file.contentType && file.contentType.match(/^image/)
        ? file.url || undefined
        : undefined,
    [file]
  );
  const date = parseHmisDateString(file.dateCreated);

  return (
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
      handleRemove={handleRemove}
    />
  );
};

export default FileSummary;
