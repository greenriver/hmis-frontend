import CloseIcon from '@mui/icons-material/Close';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogProps,
  DialogTitle,
  Divider,
  IconButton,
  Pagination,
  Stack,
  Typography,
} from '@mui/material';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.js?url';
import React, { useMemo, useState } from 'react';
import { pdfjs } from 'react-pdf';
import { Document, Page } from 'react-pdf/dist/esm/entry.vite';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

import { FileFieldsFragment } from '@/types/gqlTypes';

export type FileDialogProps = {
  file: FileFieldsFragment;
  actions?: React.ReactNode;
} & DialogProps;

const LoadingPreview: React.FC = () => (
  <Stack
    gap={3}
    my={3}
    alignItems='center'
    sx={(theme) => ({ color: theme.palette.text.secondary })}
  >
    <CircularProgress size={60} color='inherit' />
    <Typography color='inherit' fontSize='1.5rem'>
      Loading Preview
    </Typography>
  </Stack>
);

const ImagePreview: React.FC<{ file: FileFieldsFragment }> = ({ file }) => {
  const [loaded, setLoaded] = useState<boolean>(false);

  return (
    <>
      {!loaded && <LoadingPreview />}
      <Box
        sx={(theme) => ({
          boxShadow: theme.shadows[1],
          backgroundColor: theme.palette.background.paper,
          maxWidth: '100%',
          display: loaded ? undefined : 'none',
        })}
        component='img'
        src={file.url}
        onLoad={() => setLoaded(true)}
      />
    </>
  );
};

const PdfPreview: React.FC<{ file: FileFieldsFragment }> = ({ file }) => {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [numPages, setNumPages] = useState<number | undefined>(undefined);
  return (
    <Box>
      {numPages && numPages > 1 && (
        <Stack
          direction='row'
          mb={1}
          justifyContent='space-between'
          alignItems='center'
        >
          <Typography>
            Page {pageNumber} of {numPages}
          </Typography>
          <Pagination
            page={pageNumber}
            count={numPages}
            onChange={(e, page) => setPageNumber(page)}
          />
        </Stack>
      )}
      <Document
        file={{
          url: file.url,
        }}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={<LoadingPreview />}
      >
        <Page
          pageNumber={pageNumber}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </Box>
  );
};

const FileDialog: React.FC<FileDialogProps> = ({ file, actions, ...props }) => {
  const { onClose } = props;

  const previewContent = useMemo(() => {
    if (['image/jpeg', 'image/jpg', 'image/png'].includes(file.contentType)) {
      return <ImagePreview file={file} />;
    } else if (file.contentType === 'application/pdf') {
      return <PdfPreview file={file} />;
    } else {
      return (
        <Box
          sx={(theme) => ({
            boxShadow: theme.shadows[1],
            backgroundColor: theme.palette.background.paper,
            padding: 6,
            my: 6,
            textAlign: 'center',
          })}
        >
          <Box
            sx={(theme) => ({
              fontSize: '3rem',
              textAlign: 'center',
              color: theme.palette.text.secondary,
              backgroundColor: theme.palette.grey[300],
              display: 'inline-flex',
              padding: 3,
              borderRadius: 1000,
              mb: 2,
            })}
          >
            <ImageNotSupportedIcon fontSize='inherit' color='inherit' />
          </Box>
          <Typography
            fontSize='2rem'
            color='textSecondary'
            gutterBottom
            align='center'
          >
            No Preview Available
          </Typography>
          <Typography align='center'>
            Please{' '}
            <a href={file.url} target='_blank'>
              download the file
            </a>{' '}
            to view
          </Typography>
        </Box>
      );
    }
  }, [file]);

  return (
    <Dialog maxWidth='md' scroll='body' fullWidth {...props}>
      <DialogTitle>
        <Stack
          direction='row'
          justifyContent='space-between'
          gap={2}
          alignItems='center'
        >
          <Typography
            sx={{
              fontSize: '1.5rem',
              color: (theme) => theme.palette.text.primary,
              textTransform: 'none',
            }}
          >
            {file.name}
          </Typography>
          {onClose && (
            <IconButton onClick={(evt) => onClose(evt, 'escapeKeyDown')}>
              <CloseIcon />
            </IconButton>
          )}
        </Stack>
      </DialogTitle>
      <Divider />
      {actions && (
        <Box sx={{ padding: 2.5 }}>
          <Stack
            direction='row'
            spacing={1}
            justifyContent='center'
            flexGrow={1}
          >
            {actions}
          </Stack>
        </Box>
      )}
      <Divider />
      <Box
        sx={(theme) => ({
          backgroundColor: theme.palette.grey[300],
          boxShadow: `${theme.shadows[1]} inset`,
          padding: theme.spacing(3),
          display: 'flex',
          alignContent: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        })}
      >
        {previewContent}
      </Box>
    </Dialog>
  );
};

export default FileDialog;
