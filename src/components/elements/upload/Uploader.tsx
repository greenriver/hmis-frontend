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
import { visuallyHidden } from '@mui/utils';
import { compact, flatten, isEmpty, sortBy, uniq } from 'lodash-es';
import React, { Fragment, useCallback, useMemo, useRef, useState } from 'react';
import { Accept, useDropzone } from 'react-dropzone';
import useDirectUpload from './useDirectUpload';

import SavedFileSummary from '@/components/elements/upload/fileSummary/SavedFileSummary';
import UnsavedFileSummary from '@/components/elements/upload/fileSummary/UnsavedFileSummary';
import FileThumbnailIcon from '@/components/elements/upload/FileThumbnailIcon';
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

export type SingleUploaderProps = {
  multiple?: false;
  file?: string | FileFieldsFragment;
  onChange?: (file: string | FileFieldsFragment | undefined) => void;
  onUpload?: (
    upload: DirectUpload | undefined,
    file: File | undefined
  ) => any | Promise<any>;
};

export type MultipleUploaderProps = {
  multiple: true;
  files?: (string | FileFieldsFragment)[];
  onChange?: (files: (string | FileFieldsFragment)[]) => void;
  onUpload?: (uploads: DirectUpload[], files: File[]) => any | Promise<any>;
};

export type UploaderProps = {
  accept?: Accept;
  image?: boolean;
  maxSize?: number;
  id: string;
  ariaLabel?: string | null;
} & (SingleUploaderProps | MultipleUploaderProps);

const Uploader = ({
  id,
  onChange,
  onUpload,
  accept: acceptProp,
  image: isImage = false,
  maxSize = DEFAULT_MAX_BYTES,
  multiple,
  ariaLabel,
  ...rest
}: UploaderProps) => {
  // The uploader accepts a `files` argument which can contain either:
  // - a STRING which points at a blob ID of a file that has been uploaded within this session, or
  // - a FileFieldsFragment record which points at a file record in our database, uploaded during a previous session.
  // It needs to accept both because this can be a controlled component, so the parent may be keeping track of both previous and current upload state.
  // `existingFiles` filters the list to only those files that were uploaded some previous time, so we can render them.
  // The files uploaded during this session, we render this component's internal state, `currentFiles`.
  const existingFiles: FileFieldsFragment[] = useMemo(() => {
    // Handles the differing API for a multi vs. single upload component (files vs. file)
    let filesArr;
    if (multiple) {
      const { files } = rest as MultipleUploaderProps;
      filesArr = ensureArray(files);
    } else {
      const { file } = rest as SingleUploaderProps;
      filesArr = ensureArray(file);
    }
    return filesArr.filter(
      // Filter out files from the input that are just blob IDs.
      // These should also be reflected in the currentFiles internal state object.
      (f) => typeof f !== 'string'
    ) as FileFieldsFragment[]; // Cast to keep typescript happy; now that we've filtered out all the strings, they should all be FileFieldsFragments
  }, [rest, multiple]);

  // The currentFiles are File objects (https://developer.mozilla.org/en-US/docs/Web/API/File)
  // returned by the react-dropzone callbacks. These refer to files we received in the uploader, on this session.
  // (as opposed to FileFieldsFragments, which correspond to file records in our DB that were previously uploaded)
  const [currentFiles, setCurrentFiles] = useState<File[]>([]);
  const [currentUploads, setCurrentUploads] = useState<DirectUpload[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [uploadFile] = useDirectUpload();

  const uniqueNameValidator = useCallback(
    (file: File) => {
      const existingNames = [
        // Check both current-session and previously-existing files to make sure we're permitting upload of a duplicate name
        ...existingFiles.map((f) => f.name),
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
          if (multiple) {
            if (onChange) {
              onChange([
                ...existingFiles,
                ...newUploads.map((u) => u.signedBlobId),
              ]);
            }
            if (onUpload) {
              onUpload(newUploads, newFiles);
            }
          } else {
            const singleUpload = newUploads[0];
            const singleFile = newFiles[0];
            if (onChange && singleUpload) {
              onChange(singleUpload.signedBlobId);
            }
            if (onUpload && singleFile && singleUpload) {
              onUpload(singleUpload, singleFile);
            }
          }
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
      multiple,
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
    onDrop: () => setErrors([]),
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

      if (multiple) {
        if (onChange) {
          onChange([
            ...existingFiles.filter((f) => f !== file),
            ...newUploads.map((u) => u.signedBlobId),
          ]);
        }
        if (onUpload) {
          onUpload(newUploads, newFiles);
        }
      } else {
        if (onChange) {
          onChange(undefined);
        }
        if (onUpload) {
          onUpload(undefined, undefined);
        }
      }
    },
    [currentFiles, currentUploads, existingFiles, multiple, onChange, onUpload]
  );

  const inputRef = useRef<HTMLInputElement | null>(null);

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
        <input
          {...getInputProps()}
          ref={inputRef}
          aria-label={ariaLabel ? ariaLabel : 'Upload file'}
        />
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
          <Box aria-live='polite'>
            {!loading &&
              (multiple ||
                (currentFiles.length === 0 && existingFiles.length === 0)) && (
                <>
                  <FileThumbnailIcon IconComponent={UploadFileIcon} />
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
          </Box>
          <Box aria-live='polite'>
            {!loading && !multiple && currentFiles[0] && (
              <UnsavedFileSummary
                file={currentFiles[0]}
                onRemove={() => {
                  removeFile(currentFiles[0]);
                  inputRef.current?.focus();
                }}
                variant='stacked'
              />
            )}
          </Box>
          {!loading && !multiple && existingFiles[0] && (
            <SavedFileSummary
              file={existingFiles[0]}
              onRemove={() => {
                removeFile(existingFiles[0]);
                inputRef.current?.focus();
              }}
              variant='stacked'
            />
          )}
          <Box aria-live='polite'>
            {errors?.map((error) => (
              <Typography
                key={error}
                variant='subtitle1'
                color='error'
                sx={{ mt: 2 }}
                aria-live='polite'
              >
                {error}
              </Typography>
            ))}
          </Box>
        </Stack>
      </Box>
      {showFileList && (
        <Card sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
          <Stack aria-live='polite' divider={<Divider />}>
            {existingFiles.map((file) => {
              return (
                <SavedFileSummary
                  key={file.id}
                  file={file}
                  onRemove={() => removeFile(file)}
                  variant='row'
                />
              );
            })}
            {currentFiles.map((file) => {
              return (
                <Fragment key={file.name}>
                  <UnsavedFileSummary
                    key={file.name} // we enforce uniqueness on file names
                    file={file}
                    onRemove={() => removeFile(file)}
                    variant='row'
                  />
                  <Box aria-live='polite' sx={visuallyHidden}>
                    Uploaded {file.name}
                  </Box>
                </Fragment>
              );
            })}
          </Stack>
        </Card>
      )}
    </Stack>
  );
};

export default Uploader;
