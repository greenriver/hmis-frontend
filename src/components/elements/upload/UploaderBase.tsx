import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  alpha,
  Box,
  Card,
  Divider,
  LinearProgress,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { compact, flatten, isEmpty, sortBy, uniq } from 'lodash-es';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Accept,
  DropzoneInputProps,
  DropzoneRootProps,
  useDropzone,
} from 'react-dropzone';

import {
  CurrentFileSummary,
  ExistingFileSummary,
  FilePreviewIcon,
} from './FileSummary';
import useDirectUpload from './useDirectUpload';

import { DirectUpload, FileFieldsFragment } from '@/types/gqlTypes';
import { ensureArray } from '@/utils/arrays';

const DEFAULT_MAX_BYTES = 3000000;
const IMAGE_FILE_TYPES = ['.png', '.jpg', '.jpeg', '.gif'];

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
  removeFile?: (file: File) => void;
  selectFiles?: VoidFunction;
  rootProps?: DropzoneRootProps;
  inputProps?: DropzoneInputProps;
  accept?: Accept;
  maxSize: number;
  multiple?: boolean;
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
  // The uploader accepts a `files` argument which can contain either:
  // - a STRING which points at a blob ID of a file that has been uploaded within this session, or
  // - a FileFieldsFragment record which points at a file record in our database, uploaded during a previous session.
  // `existingFiles` filters the list to only those files that were uploaded some previous time, so we can render them.
  // The files uploaded during this session, we render this component's internal state, `currentFiles`.
  const existingFiles = useMemo(
    () => ensureArray(files).filter((f) => typeof f !== 'string'),
    [files]
  );

  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [currentUploads, setCurrentUploads] = useState<DirectUpload[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [uploadFile] = useDirectUpload();

  const uniqueNameValidator = useCallback(
    (file: File) => {
      const existingNames = [
        ...existingFiles.map((f) => (f as FileFieldsFragment).name),
        ...currentFiles.map((f) => f.name),
      ];

      if (existingNames.includes(file.name)) {
        return {
          code: 'name-not-unique',
          message: `File name is not unique`,
        };
      }

      return null;
    },
    [existingFiles, currentFiles]
  );

  const uploadAndCreate = useCallback(
    (acceptedFiles: File[]) => {
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
    validator: uniqueNameValidator,
  });

  const removeFile = useCallback(
    (file: File | FileFieldsFragment) => {
      const newFiles = currentFiles.filter((f) => f !== file);
      const newUploads = currentUploads.filter(
        // This is probably not ideal, but we do enforce file name uniqueness, so it should work
        (upload) => upload.filename !== file.name
      );
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

  const showFileList = useMemo(
    () => multiple && (currentFiles.length > 0 || existingFiles.length > 0),
    [currentFiles.length, existingFiles.length, multiple]
  );

  return (
    <Stack>
      <Box
        sx={({ palette, shape }) => ({
          minHeight: '150px',
          transition: 'background 300ms',
          borderRadius: `${shape.borderRadius}px`,
          border: `1px dashed ${palette.divider}`,
          // Adjust bottom border if file list is showing (only for multi)
          ...(showFileList && {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderBottom: 0,
          }),
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
                  <Link onClick={open} variant='inherit'>
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
          {!loading && !multiple && currentFiles[0] && (
            <CurrentFileSummary
              file={currentFiles[0]}
              onRemove={() => removeFile(currentFiles[0])}
              variant='stacked'
            />
          )}
          {!loading && !multiple && existingFiles[0] && (
            <ExistingFileSummary
              file={existingFiles[0] as FileFieldsFragment}
              onRemove={() =>
                removeFile(existingFiles[0] as FileFieldsFragment)
              }
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
      {showFileList && (
        <Card sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          <Stack divider={<Divider />}>
            {existingFiles.map((file) => {
              return (
                <ExistingFileSummary
                  key={(file as FileFieldsFragment).id} // it will always be a FileFieldsFragment, ts is just confused
                  file={file as FileFieldsFragment}
                  onRemove={() => removeFile(file as FileFieldsFragment)}
                  variant='row'
                />
              );
            })}
            {currentFiles.map((file) => {
              return (
                <CurrentFileSummary
                  key={file.name} // we enforce uniqueness on file names
                  file={file}
                  onRemove={() => removeFile(file)}
                  variant='row'
                />
              );
            })}
          </Stack>
        </Card>
      )}
    </Stack>
  );
};

/*
 * SingleUploader provides a wrapper api around Uploader for callers that want
 * an uploader that only accepts one file at a time. (E.g. Client Image upload)
 */
export const SingleUploader: React.FC<
  Omit<UploaderProps, 'multiple' | 'onUpload'> & {
    onUpload: (upload: DirectUpload, file: File) => any | Promise<any>;
  }
> = ({ onUpload, ...props }) => {
  return (
    <Uploader
      multiple={false}
      onUpload={(uploads: DirectUpload[], files: File[]) => {
        if (onUpload) onUpload(uploads[0], files[0]);
      }}
      {...props}
    />
  );
};

export default Uploader;
