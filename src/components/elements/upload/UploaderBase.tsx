import { HighlightOff as HighlightOffIcon } from '@mui/icons-material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  Grid,
  Typography,
  Box,
  Link,
  Tooltip,
  alpha,
  LinearProgress,
  SvgIconProps,
} from '@mui/material';
import { first } from 'lodash-es';
import React, { useCallback, useState } from 'react';
import {
  DropzoneInputProps,
  DropzoneRootProps,
  useDropzone,
} from 'react-dropzone';

import useDirectUpload from './useDirectUpload';

import { DirectUpload } from '@/types/gqlTypes';

export type UploaderProps = {
  onUpload: (upload: DirectUpload, file: File) => any | Promise<any>;
  onClear?: (upload?: DirectUpload, file?: File) => any;
  file?: File;
  children?: React.ReactNode | ((args: ChildrenArgs) => React.ReactElement);
};

export type ChildrenArgs = {
  file?: File;
  loading?: boolean;
  error?: string | undefined;
  previewUrl?: string;
  dragging?: boolean;
  clearFile?: UploaderProps['onClear'];
  selectFile?: VoidFunction;
  rootProps?: DropzoneRootProps;
  inputProps?: DropzoneInputProps;
};

const MAX_BYTES = 3000000;
const ACCEPTED_FILE_TYPES = ['.png', '.jpg', '.jpeg'];

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

const defaultChildren: NonNullable<UploaderProps['children']> = ({
  file,
  loading,
  error,
  previewUrl,
  dragging,
  clearFile = () => {},
  selectFile = () => {},
  rootProps = {},
  inputProps = {},
}) => (
  <Box
    sx={({ palette, shape }) => ({
      minHeight: '150px',
      transition: 'background 300ms',
      borderRadius: `${shape.borderRadius}px`,
      border: `1px dashed ${palette.divider}`,
      backgroundColor: dragging
        ? alpha(palette.primary.light, 0.12)
        : 'transparent',
      overflow: 'hidden',
    })}
    {...rootProps}
  >
    <input {...inputProps} />
    <Grid
      container
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '150px',
        textAlign: 'center',
        p: 2,
      }}
    >
      <Grid item>
        {!loading && !file && (
          <>
            <FilePreviewIcon IconComponent={UploadFileIcon} />
            <Typography variant='subtitle1' color='inherit'>
              <Link onClick={selectFile} variant='inherit'>
                Click to upload
              </Link>{' '}
              or drag and drop
            </Typography>
            <Typography variant='body2' color='GrayText' sx={{ mt: 1 }}>
              SVG, PNG, JPG or GIF (max. 3MB)
            </Typography>
          </>
        )}
        {!loading && file && (
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
            <Typography color='inherit'>{file?.name}</Typography>
            <Tooltip title='Clear uploaded image'>
              <Link
                component='button'
                underline='none'
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
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
          </>
        )}
        {loading && (
          <>
            <Typography variant='subtitle1' color='inherit' gutterBottom>
              Uploading
            </Typography>
            <LinearProgress variant='indeterminate' />
          </>
        )}
        {error && (
          <Typography variant='subtitle1' color='error' sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Grid>
    </Grid>
  </Box>
);

const Uploader: React.FC<UploaderProps> = ({
  onUpload,
  onClear = () => {},
  file: fileProp,
}) => {
  const [currentFile, setCurrentFile] = useState<File>();
  const [currentUpload, setCurrentUpload] = useState<DirectUpload>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>();
  const file = fileProp || currentFile;
  const fileImageUrl =
    file && file.type.match(/^image/) ? URL.createObjectURL(file) : undefined;
  // const isEmpty = !file;

  const [uploadFile] = useDirectUpload();
  const uploadAndCreate = useCallback(
    (acceptedFiles: File[]) => {
      const file = first(acceptedFiles);
      if (file) {
        setLoading(true);
        setCurrentFile(file);
        uploadFile(file)
          .then((res) => {
            setCurrentUpload(res);
            onUpload(res, file);
          })
          .then(() => setLoading(false));
      }
    },
    [uploadFile, onUpload]
  );

  const { getRootProps, isDragActive, getInputProps, open } = useDropzone({
    onDropAccepted: uploadAndCreate,
    multiple: false,
    accept: {
      'image/*': ACCEPTED_FILE_TYPES,
    },
    maxSize: MAX_BYTES,
    noClick: true,
    onDrop: (acceptedFiles, fileRejections) => {
      fileRejections.forEach((file) => {
        file.errors.forEach((err) => {
          if (err.code === 'file-too-large') {
            setError(
              `Image is too large. File size must be under ${
                MAX_BYTES / 1000000
              } MB.`
            );
          } else if (err.code === 'file-invalid-type') {
            setError(
              `Unsupported file type. Supported file types are: ${ACCEPTED_FILE_TYPES.join(
                ', '
              )}`
            );
          } else {
            setError(`Error: ${err.message || err.code}`);
          }
          setCurrentFile(undefined);
        });
      });
      acceptedFiles.forEach(() => setError(undefined));
    },
  });

  const handleClear = useCallback<NonNullable<UploaderProps['onClear']>>(() => {
    onClear(currentUpload, currentFile);
    setCurrentFile(undefined);
    setCurrentUpload(undefined);
  }, [currentUpload, currentFile, onClear]);

  return defaultChildren({
    file,
    loading,
    error,
    previewUrl: fileImageUrl,
    dragging: isDragActive,
    clearFile: handleClear,
    selectFile: open,
    rootProps: getRootProps(),
    inputProps: getInputProps(),
  });
};

export default Uploader;
