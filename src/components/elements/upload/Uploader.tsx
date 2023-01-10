import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
  HighlightOff as HighlightOffIcon,
} from '@mui/icons-material';
import {
  Grid,
  Typography,
  CircularProgress,
  Box,
  Link,
  Tooltip,
} from '@mui/material';
import { first } from 'lodash-es';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import useDirectUpload from './useDirectUpload';

import { DirectUpload } from '@/types/gqlTypes';

export type UploaderProps = {
  onUpload: (upload: DirectUpload, file: File) => any | Promise<any>;
  onClear?: (upload?: DirectUpload, file?: File) => any;
  file?: File;
};

const MAX_BYTES = 8000000;
const ACCEPTED_FILE_TYPES = ['.png', '.jpg', '.jpeg'];

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

  const { getRootProps, isDragActive, getInputProps } = useDropzone({
    onDropAccepted: uploadAndCreate,
    multiple: false,
    accept: {
      'image/*': ACCEPTED_FILE_TYPES,
    },
    maxSize: MAX_BYTES,
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

  return (
    <Box
      sx={({ palette }) => ({
        minHeight: '150px',
        transition: 'background 300ms',
        borderRadius: 4,
        border: `3px dashed ${palette.divider}`,
        backgroundColor: isDragActive ? palette.grey[200] : 'transparent',
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: palette.grey[200],
        },
        p: 2,
      })}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      <Grid
        container
        sx={({ palette }) => ({
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '150px',
          textAlign: 'center',
          color: palette.text.secondary,
        })}
      >
        <Grid item>
          {!loading && !file && (
            <>
              <UploadIcon style={{ fontSize: '72px', color: 'inherit' }} />
              <Typography variant='subtitle1' color='inherit'>
                Drag file or click here to upload
              </Typography>
            </>
          )}
          {!loading && file && (
            <>
              {fileImageUrl ? (
                <Box
                  component='img'
                  alt='file preview'
                  src={fileImageUrl}
                  sx={{
                    width: '72px',
                    height: '72px',
                    borderRadius: (theme) => `${theme.shape.borderRadius}px`,
                  }}
                />
              ) : (
                <FileIcon style={{ fontSize: '72px', color: 'inherit' }} />
              )}
              <Typography variant='subtitle1' color='inherit'>
                {file?.name}
              </Typography>
              <Tooltip title='Clear uploaded image'>
                <Link
                  component='button'
                  underline='none'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                >
                  <Typography
                    variant='caption'
                    color='textSecondary'
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      lineHeight: 0,
                    }}
                  >
                    <HighlightOffIcon fontSize='inherit' />
                    &ensp;Clear
                  </Typography>
                </Link>
              </Tooltip>
            </>
          )}
          {loading && (
            <>
              <CircularProgress color='inherit' size={72} />
              <Typography variant='subtitle1' color='inherit'>
                Uploading ...
              </Typography>
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
};

export default Uploader;
