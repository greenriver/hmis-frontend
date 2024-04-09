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
import { compact, first, flatten, isEmpty, sortBy, uniq } from 'lodash-es';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Accept,
  DropzoneInputProps,
  DropzoneRootProps,
  useDropzone,
} from 'react-dropzone';

import useDirectUpload from './useDirectUpload';

import { DirectUpload } from '@/types/gqlTypes';

export type UploaderProps = {
  id: string;
  onUpload: (upload: DirectUpload, file: File) => any | Promise<any>;
  onClear?: (upload?: DirectUpload, file?: File) => any;
  file?: File;
  accept?: Accept;
  image?: boolean;
  maxSize?: number;
  children?: React.ReactNode | ((args: ChildrenArgs) => React.ReactElement);
};

export type ChildrenArgs = {
  id: string;
  file?: File;
  loading?: boolean;
  error?: string | undefined;
  previewUrl?: string;
  dragging?: boolean;
  clearFile?: UploaderProps['onClear'];
  selectFile?: VoidFunction;
  rootProps?: DropzoneRootProps;
  inputProps?: DropzoneInputProps;
  accept?: Accept;
  maxSize: number;
};

const DEFUALT_MAX_BYTES = 3000000;
const IMAGE_FILE_TYPES = ['.png', '.jpg', '.jpeg', '.gif'];

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

const getFileTypesFromAccept = (accept: Accept) => {
  let arr = sortBy(
    compact(uniq(flatten(Object.values(accept)))).map((e) =>
      e.toUpperCase().replace(/\.(.*)/, '$1')
    )
  );

  if (arr.length === 2) arr = [arr.join(' or ')];
  if (arr.length > 2) arr = [...arr.slice(0, -2), arr.slice(-2).join(' or ')];

  return arr.join(', ');
};

const getReadableSize = (maxSize: number) =>
  `${(maxSize / 1000000).toFixed(1)}MB`;

const defaultChildren: NonNullable<UploaderProps['children']> = ({
  id,
  file,
  loading,
  error,
  previewUrl,
  dragging,
  clearFile = () => {},
  selectFile = () => {},
  rootProps = {},
  inputProps = {},
  accept,
  maxSize,
}) => (
  <Box
    sx={({ palette, shape }) => ({
      minHeight: '150px',
      transition: 'background 300ms',
      borderRadius: `${shape.borderRadius}px`,
      border: `1px dashed ${palette.divider}`,
      backgroundColor: dragging
        ? alpha(palette.primary.light, 0.12)
        : palette.background.paper,
      overflow: 'hidden',
    })}
    {...rootProps}
    id={id}
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
              {accept ? getFileTypesFromAccept(accept) : 'Any file type'} (max.{' '}
              {getReadableSize(maxSize)})
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
  id,
  onUpload,
  onClear = () => {},
  file: fileProp,
  image: isImage = false,
  accept: acceptProp,
  maxSize = DEFUALT_MAX_BYTES,
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
          .then(() => setLoading(false))
          .catch((error) => {
            setLoading(false);
            setError(error.message);
          });
      }
    },
    [uploadFile, onUpload]
  );

  const accept = useMemo(() => {
    const base: Accept = {
      ...(isImage ? { 'image/*': IMAGE_FILE_TYPES } : {}),
      ...acceptProp,
    };

    return isEmpty(base) ? undefined : base;
  }, [isImage, acceptProp]);

  const { getRootProps, isDragActive, getInputProps, open } = useDropzone({
    onDropAccepted: uploadAndCreate,
    multiple: false,
    accept,
    maxSize,
    noClick: true,
    onDrop: (acceptedFiles, fileRejections) => {
      fileRejections.forEach((file) => {
        file.errors.forEach((err) => {
          if (err.code === 'file-too-large') {
            setError(
              `Image is too large. File size must be under ${getReadableSize(
                maxSize
              )}`
            );
          } else if (err.code === 'file-invalid-type') {
            setError(
              `Unsupported file type. ${
                accept
                  ? `Supported file types are: ${getFileTypesFromAccept(
                      accept
                    )}`
                  : ''
              }`
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
    id,
    file,
    loading,
    error,
    previewUrl: fileImageUrl,
    dragging: isDragActive,
    clearFile: handleClear,
    selectFile: open,
    rootProps: getRootProps(),
    inputProps: getInputProps(),
    accept,
    maxSize,
  });
};

export default Uploader;
