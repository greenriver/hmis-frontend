import { Typography, Link, Alert } from '@mui/material';
import { Box } from '@mui/system';
import { ComponentStory, Meta } from '@storybook/react';

import MOCK_IMAGE from './MOCK_IMAGE';
import Uploader from './UploaderBase';

export default {
  title: 'Uploader',
  component: Uploader,
} as Meta<typeof Uploader>;

const Template: ComponentStory<typeof Uploader> = (args) => {
  return (
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
  );
};

export const Default = Template.bind({});
Default.args = {
  onUpload: async (upload, file) => {
    console.log({ upload, file });
  },
};
