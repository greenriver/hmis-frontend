import CloseIcon from '@mui/icons-material/Close';
import DataObjectIcon from '@mui/icons-material/DataObject';
import { Box, Button, Drawer, IconButton, Typography } from '@mui/material';
import React, { useState } from 'react';
import FormJsonPanel from './FormJsonPanel';

interface Props {
  jsonString: string;
}

const FormJsonDrawer: React.FC<Props> = ({ jsonString }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant='text'
        startIcon={<DataObjectIcon />}
        onClick={() => setOpen(true)}
      >
        View JSON
      </Button>
      <Drawer
        anchor='right'
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            borderTop: 'none',
            width: '50vw',
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <Box
          display='flex'
          alignItems='center'
          justifyContent='space-between'
          px={2}
          py={1}
          flexShrink={0}
          sx={(theme) => ({
            borderBottom: `1px solid ${theme.palette.divider}`,
          })}
        >
          <Typography component='h2' variant='h5'>
            Form JSON
          </Typography>
          <IconButton
            aria-label='close'
            onClick={() => setOpen(false)}
            sx={{ color: 'grayscale.light' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box flex={1} minHeight={0}>
          <FormJsonPanel value={jsonString} readOnly />
        </Box>
      </Drawer>
    </>
  );
};

export default FormJsonDrawer;
