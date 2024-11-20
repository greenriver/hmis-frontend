import { HighlightOff as HighlightOffIcon } from '@mui/icons-material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  alpha,
  Box,
  Button,
  Card,
  Divider,
  LinearProgress,
  Link,
  Stack,
  SvgIconProps,
  Tooltip,
  Typography,
} from '@mui/material';
import { compact, flatten, isEmpty, sortBy, uniq } from 'lodash-es';
import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import {
  Accept,
  DropzoneInputProps,
  DropzoneRootProps,
  useDropzone,
} from 'react-dropzone';

import useDirectUpload from './useDirectUpload';

import theme from '@/config/theme';
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
  fileName: string;
  previewUrl?: string;
  handleClear: VoidFunction;
  info?: ReactNode;
  variant: 'row' | 'stacked';
}> = ({ fileName, previewUrl, handleClear, info, variant = 'stacked' }) => {
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
          <Tooltip title='Clear uploaded file'>
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
        </Box>
      </>
    );
  }

  return (
    <Stack sx={{ p: 1 }} direction='row' justifyContent='space-between'>
      <Stack spacing={1} direction='row' alignItems='center'>
        {preview}
        <Typography color='inherit'>{fileName}</Typography>
        {info}
      </Stack>
      <Stack spacing={1} direction='row' alignItems='center'>
        <Button variant='text' onClick={() => {}}>
          View
        </Button>
        <Button variant='text' onClick={() => {}}>
          Download
        </Button>
        <Button variant='text' onClick={handleClear}>
          Delete
        </Button>
      </Stack>
    </Stack>
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

export type ChildrenArgs = {
  id: string;
  currentFiles?: File[];
  existingFiles?: FileFieldsFragment[];
  loading?: boolean;
  errors?: string[] | undefined;
  dragging?: boolean;
  clearFile?: (file: File) => void;
  selectFile?: VoidFunction; // todo @Martha - this should be renamed
  rootProps?: DropzoneRootProps;
  inputProps?: DropzoneInputProps;
  accept?: Accept;
  maxSize: number;
  multiple?: boolean;
};

const defaultChildren: NonNullable<UploaderProps['children']> = ({
  id,
  currentFiles = [],
  existingFiles = [],
  loading,
  errors,
  dragging,
  clearFile = () => {},
  selectFile = () => {},
  rootProps = {},
  inputProps = {},
  accept,
  maxSize,
  multiple = false,
}) => {
  // todo @martha - clear vs. delete language
  return (
    <Stack spacing={1}>
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
          {loading && (
            <Box>
              <Typography variant='subtitle1' color='inherit' gutterBottom>
                Uploading
              </Typography>
              <LinearProgress variant='indeterminate' />
            </Box>
          )}
          {!loading &&
            (multiple ||
              (currentFiles.length === 0 && existingFiles.length === 0)) && (
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
          {/* todo @Martha - in single upload case you still want to bre able to see previously uploaded file */}
          {/* todo @martha - maybe make a parent of FilePreview for each type of File and FileFieldsFragment? */}
          {!loading && !multiple && currentFiles[0] && (
            <FilePreview
              key={currentFiles[0].name}
              fileName={currentFiles[0].name}
              previewUrl={
                currentFiles[0].type.match(/^image/)
                  ? URL.createObjectURL(currentFiles[0])
                  : undefined
              }
              handleClear={() => clearFile(currentFiles[0])}
              variant='stacked'
            />
          )}
          {!loading && !multiple && existingFiles[0] && (
            <FilePreview
              key={existingFiles[0].name}
              fileName={existingFiles[0].name}
              previewUrl={
                existingFiles[0].contentType?.match(/^image/)
                  ? existingFiles[0].url || undefined
                  : undefined
              }
              handleClear={() => {}} // todo @Martha
              variant='stacked'
            />
          )}
          {errors?.map((error) => (
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
      {multiple && (currentFiles.length > 0 || existingFiles.length > 0) && (
        <Card sx={{}}>
          <Stack divider={<Divider />}>
            {existingFiles
              .filter((file) => !!file?.id)
              .map((file) => {
                // todo @martha - this is more logic that's in two places
                return (
                  <FilePreview
                    key={file.id}
                    previewUrl={
                      file.contentType?.match(/^image/)
                        ? file.url || undefined
                        : undefined
                    } // todo @martha well this is a bit silly isnt it
                    fileName={file.name}
                    handleClear={() => {}} // todo @martha
                    variant='row'
                    info={
                      <Typography sx={{ color: theme.palette.grey[500] }}>
                        (saved)
                      </Typography>
                    } //  {formatRelativeDate(file.dateCreated) todo @martha
                  />
                );
              })}
            {currentFiles.map((file) => {
              // todo @martha - previewUrl logic is now in 2 places and never memoized
              return (
                <FilePreview
                  key={file.name} // todo @martha ugh
                  fileName={file.name}
                  previewUrl={
                    file.type?.match(/^image/)
                      ? URL.createObjectURL(file)
                      : undefined
                  }
                  handleClear={() => clearFile(file)}
                  variant='row'
                  info={
                    <Typography sx={{ color: theme.palette.warning.main }}>
                      (unsaved)
                    </Typography>
                  }
                />
              );
            })}
          </Stack>
        </Card>
      )}
    </Stack>
  );
};

export type UploaderProps = {
  id: string;
  files?: (string | FileFieldsFragment)[];
  onChange?: (files: (string | FileFieldsFragment)[]) => void;
  onUpload?: (uploads: DirectUpload[], files: File[]) => any | Promise<any>;
  accept?: Accept;
  image?: boolean;
  maxSize?: number;
  multiple?: boolean;
  children?: React.ReactNode | ((args: ChildrenArgs) => React.ReactElement);
};

const Uploader: React.FC<UploaderProps> = ({
  id,
  files,
  onChange,
  onUpload,
  accept: acceptProp,
  image: isImage = false,
  maxSize = DEFAULT_MAX_BYTES,
  multiple = false,
}) => {
  const existingFiles = useMemo(
    () => ensureArray(files).filter((f) => typeof f !== 'string'),
    [files]
  );

  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [currentUploads, setCurrentUploads] = useState<DirectUpload[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [uploadFile] = useDirectUpload();

  const uploadAndCreate = useCallback(
    (acceptedFiles: File[]) => {
      // todo @martha - confirm that accepted files does not include rejections
      setLoading(true);
      const newFiles = [...currentFiles, ...acceptedFiles];

      Promise.all(acceptedFiles.map((f) => uploadFile(f)))
        .then((responses) => {
          const newUploads = [...currentUploads, ...responses];
          setCurrentFiles(newFiles);
          setCurrentUploads(newUploads);
          if (onChange)
            onChange([...existingFiles, ...newUploads.map((u) => u.blobId)]);
          if (onUpload) onUpload(newUploads, newFiles);
          setLoading(false);
        })
        .catch((error) => {
          setLoading(false);
          setErrors([error.message]);
        });
    },
    [
      currentFiles,
      uploadFile,
      currentUploads,
      onChange,
      existingFiles,
      onUpload,
    ]
  );

  const accept = useMemo(() => {
    const base: Accept = {
      ...(isImage ? { 'image/*': IMAGE_FILE_TYPES } : {}),
      ...acceptProp,
    };

    return isEmpty(base) ? undefined : base;
  }, [isImage, acceptProp]);

  const { getRootProps, isDragActive, getInputProps, open } = useDropzone({
    multiple,
    accept,
    maxSize,
    noClick: true,
    onDropAccepted: uploadAndCreate,
    onDropRejected: (fileRejections) => {
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
    },
  });

  // todo @Martha - also consider with 'clear' and 'delete' internal language in the code, maybe it's 'remove'?
  const clearFile = useCallback(
    (file: File | FileFieldsFragment) => {
      const newFiles = currentFiles.filter((f) => f !== file);
      const newUploads = currentUploads.filter(
        (upload) => upload.filename !== file.name
      ); // todo @martha - brittle, but how to get around? uploads and files are not currently associated together
      setCurrentFiles(newFiles);
      setCurrentUploads(newUploads);
      if (onUpload) onUpload(newUploads, newFiles);
      if (onChange)
        onChange([
          ...existingFiles.filter((f) => f !== file),
          ...newUploads.map((u) => u.blobId),
        ]);
    },
    [currentFiles, currentUploads, existingFiles, onChange, onUpload]
  );

  return defaultChildren({
    id,
    currentFiles,
    existingFiles,
    loading,
    errors,
    dragging: isDragActive,
    clearFile,
    selectFile: open,
    rootProps: getRootProps(),
    inputProps: getInputProps(),
    accept,
    maxSize,
    multiple,
  });
};

export default Uploader;
