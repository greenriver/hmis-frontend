import { Box, Pagination, Paper, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import Loading from '@/components/elements/Loading';
import FilePreviewUnavailable from '@/components/elements/upload/fileDialog/FilePreviewUnavailable';
import { FileFieldsFragment } from '@/types/gqlTypes';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface Props {
  file: FileFieldsFragment;
}

/**
 * Renders a preview of a PDF file, with pagination.
 */
const PdfPreview: React.FC<Props> = ({ file: { url } }) => {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [numPages, setNumPages] = useState<number | undefined>(undefined);

  if (!url) return <FilePreviewUnavailable />;

  return (
    <>
      {numPages && numPages > 1 && (
        <Paper sx={{ width: '100%', mb: 1 }}>
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
      <Box>
        <Document
          file={url}
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
              <Loading />
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

export default PdfPreview;
