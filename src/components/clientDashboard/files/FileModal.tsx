import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import {
  Box,
  CircularProgress,
  DialogProps,
  Link,
  Pagination,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

import useSafeParams from '@/hooks/useSafeParams';
import ViewRecordDialog from '@/modules/form/components/ViewRecordDialog';
import { FileFieldsFragment, RecordFormRole } from '@/types/gqlTypes';

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

  if (!file.url) return null;

  return (
    <Box p={2}>
      {!loaded && <LoadingPreview />}
      <Box
        sx={(theme) => ({
          boxShadow: theme.shadows[1],
          backgroundColor: theme.palette.background.paper,
          borderRadius: `${theme.shape.borderRadius}px`,
          maxWidth: '100%',
          display: loaded ? undefined : 'none',
        })}
        component='img'
        src={file.url}
        onLoad={() => setLoaded(true)}
      />
    </Box>
  );
};

const PdfPreview: React.FC<{ file: FileFieldsFragment }> = ({
  file: { url },
}) => {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [numPages, setNumPages] = useState<number | undefined>(undefined);

  const fileProp = useMemo(() => (url ? { url } : null), [url]);

  return (
    <>
      {numPages && numPages > 1 && (
        <Paper sx={{ width: '100%' }}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            px={2}
            py={1}
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
        </Paper>
      )}
      <Box my={4}>
        <Document
          file={fileProp}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <Box
              bgcolor='grey.100'
              width={612}
              height={792}
              display='flex'
              justifyContent='center'
              alignItems='center'
            >
              <LoadingPreview />
            </Box>
          }
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </Box>
    </>
  );
};

const FileDialog: React.FC<FileDialogProps> = ({ file, actions, ...props }) => {
  const { clientId } = useSafeParams() as { clientId?: string };
  const previewContent = useMemo(() => {
    if (
      file.contentType &&
      ['image/jpeg', 'image/jpg', 'image/png'].includes(file.contentType)
    ) {
      return <ImagePreview file={file} />;
    } else if (file.contentType === 'application/pdf') {
      return <PdfPreview file={file} />;
    } else {
      return (
        <Box
          sx={(theme) => ({
            backgroundColor: theme.palette.background.paper,
            padding: 6,
            my: 6,
            textAlign: 'center',
            borderRadius: `${theme.shape.borderRadius}px`,
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
          {file.url && (
            <Typography align='center'>
              Please{' '}
              <Link href={file.url} target='_blank' variant='inherit'>
                download the file
              </Link>{' '}
              to view
            </Typography>
          )}
        </Box>
      );
    }
  }, [file]);
  const pickListArgs = useMemo(() => ({ clientId }), [clientId]);

  return (
    <>
      {file && (
        <ViewRecordDialog<FileFieldsFragment>
          {...props}
          record={file}
          formRole={RecordFormRole.File}
          title={file.name}
          actions={actions}
          pickListArgs={pickListArgs}
        >
          <Stack
            width='100%'
            display='flex'
            alignItems='center'
            justifyContent='center'
          >
            <Paper sx={{ width: '100%' }}>
              <Typography p={2} variant='h6' component='p'>
                File Preview
              </Typography>
              <Box
                sx={(theme) => ({
                  backgroundColor: theme.palette.grey[300],
                  padding: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: `${theme.shape.borderRadius}px`,
                  mx: 2,
                  mb: 2,
                })}
              >
                {previewContent}
              </Box>
            </Paper>
          </Stack>
        </ViewRecordDialog>
      )}
    </>
  );
};

export default FileDialog;
