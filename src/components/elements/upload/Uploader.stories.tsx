import { Alert, Link, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Meta, StoryObj } from '@storybook/react';

import MOCK_IMAGE from './MOCK_IMAGE';
import Uploader from './UploaderBase';

import { createDirectUploadMock, getFileMock } from '@/test/__mocks__/requests';

export default {
  component: Uploader,
  parameters: {
    apolloClient: {
      mocks: [getFileMock, createDirectUploadMock],
    },
  },
  render: (args) => (
    <>
      <Uploader
        {...args}
        onUpload={async (upload, file) => {
          const targetElem = document.getElementById('result');
          if (targetElem)
            targetElem.innerHTML = JSON.stringify({ upload, file }, null, 2);
        }}
      />

      <Alert severity='info' sx={{ my: 2 }}>
        <Typography>
          You must use the following image to test this so that the query
          variables match those that are expected. Do not rename the download.
        </Typography>
        <Typography>
          <Link variant='inherit' href={MOCK_IMAGE} download='image.jpeg'>
            Get image
          </Link>
        </Typography>
      </Alert>

      <Box
        component='pre'
        id='result'
        sx={{ p: 2, borderRadius: 4, backgroundColor: 'grey.100' }}
      >
        <Typography sx={({ palette }) => ({ color: palette.text.disabled })}>
          Results will show here
        </Typography>
      </Box>
    </>
  ),
} as Meta<typeof Uploader>;

type Story = StoryObj<typeof Uploader>;
export const Default: Story = {
  args: {
    onUpload: async (upload: any, file: any) => {
      // eslint-disable-next-line no-console
      console.log({ upload, file });
    },
  },
};
