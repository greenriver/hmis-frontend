import {
  CloudUpload as UploadIcon,
  Description as FileIcon,
} from '@mui/icons-material';
import { Grid, Typography, CircularProgress, Box } from '@mui/material';
import { first } from 'lodash-es';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import useDirectUpload from './useDirectUpload';

import { DirectUpload } from '@/types/gqlTypes';

const Uploader: React.FC<{
  onUpload: (upload: DirectUpload, file: File) => any | Promise<any>;
  file?: File;
}> = ({ onUpload, file: fileProp }) => {
  const [currentFile, setCurrentFile] = useState<File>();
  const [loading, setLoading] = useState<boolean>(false);
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
          .then((res) => onUpload(res, file))
          .then(() => setLoading(false));
      }
    },
    [uploadFile, onUpload]
  );

  const { getRootProps, isDragActive, getInputProps } = useDropzone({
    onDropAccepted: uploadAndCreate,
    noClick: true,
    noKeyboard: true,
    multiple: false,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
    },
  });

  return (
    <Box
      sx={({ palette }) => ({
        minHeight: '150px',
        transition: 'background 300ms',
        borderRadius: 4,
        border: `3px dashed ${palette.divider}`,
        backgroundColor: isDragActive ? palette.grey[200] : 'transparent',
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
                Drag file here to upload
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default Uploader;
