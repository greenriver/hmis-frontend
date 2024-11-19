import { HighlightOff as HighlightOffIcon } from '@mui/icons-material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  alpha,
  Box,
  Button,
  Grid,
  LinearProgress,
  Link,
  Stack,
  SvgIconProps,
  Tooltip,
  Typography,
} from '@mui/material';
import { compact, flatten, isEmpty, sortBy, uniq } from 'lodash-es';
import React, { useCallback, useMemo, useState } from 'react';
import { Accept, useDropzone } from 'react-dropzone';

import useDirectUpload from './useDirectUpload';

import FileComponent from '@/components/elements/upload/File';
import { DirectUpload, FileFieldsFragment } from '@/types/gqlTypes';
import { ensureArray } from '@/utils/arrays';

const DEFAULT_MAX_BYTES = 3000000;
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

const FilePreview: React.FC<{
  file: File;
  handleClear: VoidFunction;
}> = ({ file, handleClear }) => {
  const previewUrl = useMemo(
    () => (file.type.match(/^image/) ? URL.createObjectURL(file) : undefined),
    [file]
  );

  return (
    <Grid item sx={{ width: '120px' }}>
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
            handleClear();
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
    </Grid>
  );
};

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

export type UploaderProps = {
  id: string;
  onChange: (uploads: DirectUpload[], files: File[]) => any | Promise<any>;
  existingFiles?: FileFieldsFragment[];
  accept?: Accept;
  image?: boolean;
  maxSize?: number;
  multiple?: boolean;
};

const Uploader: React.FC<UploaderProps> = ({
  id,
  onChange,
  existingFiles,
  image: isImage = false,
  accept: acceptProp,
  maxSize = DEFAULT_MAX_BYTES,
  multiple = false,
}) => {
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [currentUploads, setCurrentUploads] = useState<DirectUpload[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [uploadFile] = useDirectUpload();

  const uploadAndCreate = useCallback(
    (acceptedFiles: File[]) => {
      setLoading(true);
      const newCurrentFiles = [...currentFiles, ...acceptedFiles];
      setCurrentFiles(newCurrentFiles);

      Promise.all(acceptedFiles.map((f) => uploadFile(f)))
        .then((responses) => {
          const newUploads = [...currentUploads, ...responses];
          setCurrentUploads(newUploads);
          onChange(newUploads, newCurrentFiles);
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          setErrors([error.message]);
        });
    },
    [currentFiles, uploadFile, currentUploads, onChange]
  );

  const accept = useMemo(() => {
    const base: Accept = {
      ...(isImage ? { 'image/*': IMAGE_FILE_TYPES } : {}),
      ...acceptProp,
    };

    return isEmpty(base) ? undefined : base;
  }, [isImage, acceptProp]);

  const {
    getRootProps,
    isDragActive,
    getInputProps,
    open: selectFile,
  } = useDropzone({
    onDropAccepted: uploadAndCreate,
    multiple,
    accept,
    maxSize,
    noClick: true,
    onDrop: (acceptedFiles, fileRejections) => {
      const errors = fileRejections.flatMap((file) =>
        file.errors.map((err) => {
          const fileName = file.file.name;
          if (err.code === 'file-too-large') {
            return `${fileName} is too large. File size must be under ${getReadableSize(maxSize)}`;
          } else if (err.code === 'file-invalid-type') {
            return `${fileName} is an unsupported file type. ${
              accept
                ? `Supported file types are: ${getFileTypesFromAccept(accept)}`
                : ''
            }`;
          } else {
            return `${fileName} Error: ${err.message || err.code}`;
          }
        })
      );
      setErrors(errors);
      setCurrentFiles(
        currentFiles.filter(
          (f) => !fileRejections.flatMap((file) => file.file).includes(f)
        )
      );
    },
  });

  const clearFile = useCallback(
    (file: File) => {
      const newFiles = currentFiles.filter((f) => f !== file);
      const newUploads = currentUploads.filter(
        (upload) => upload.filename !== file.name
      ); // todo @martha - brittle, needs ID
      setCurrentFiles(newFiles);
      setCurrentUploads(newUploads);
      onChange(newUploads, newFiles);
    },
    [currentFiles, currentUploads, onChange]
  );

  const clearAll = useCallback(() => {
    setCurrentFiles([]);
    setCurrentUploads([]);
    onChange([], []);
  }, [onChange]);

  return (
    <Stack spacing={1}>
      <Box
        sx={({ palette, shape }) => ({
          minHeight: '150px',
          transition: 'background 300ms',
          borderRadius: `${shape.borderRadius}px`,
          border: `1px dashed ${palette.divider}`,
          backgroundColor: isDragActive
            ? alpha(palette.primary.light, 0.12)
            : palette.background.paper,
          overflow: 'hidden',
        })}
        {...getRootProps()}
        id={id}
      >
        <input {...getInputProps()} />
        <Stack
          spacing={1}
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '150px',
            textAlign: 'center',
            p: 2,
          }}
        >
          {!loading && (
            <>
              <FilePreviewIcon IconComponent={UploadFileIcon} />
              <Typography variant='subtitle1' color='inherit'>
                <Link onClick={selectFile} variant='inherit'>
                  Click to upload
                </Link>{' '}
                or drag and drop
              </Typography>
              <Typography variant='body2' color='GrayText' sx={{ mt: 1 }}>
                {accept ? getFileTypesFromAccept(accept) : 'Any file type'}{' '}
                (max. {getReadableSize(maxSize)})
              </Typography>
            </>
          )}
          {loading && (
            <Box>
              <Typography variant='subtitle1' color='inherit' gutterBottom>
                Uploading
              </Typography>
              <LinearProgress variant='indeterminate' />
            </Box>
          )}
          {errors.map((error) => (
            <Typography
              key={error}
              variant='subtitle1'
              color='error'
              sx={{ mt: 2 }}
            >
              {error}
            </Typography>
          ))}
        </Stack>
      </Box>
      {currentFiles.length > 0 && <Button onClick={clearAll}>Clear all</Button>}
      <Grid container>
        {currentFiles.map((file) => (
          <FilePreview
            key={file.name}
            file={file}
            handleClear={() => clearFile(file)}
          />
        ))}
        {ensureArray(existingFiles).map((file) => {
          if (file.id) return <FileComponent id={file.id} />;
          return file.toString();
        })}
        {/*todo @Martha - existing files side by side with current files is bad*/}
      </Grid>
    </Stack>
  );
};

export default Uploader;
