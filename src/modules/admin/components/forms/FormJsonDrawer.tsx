import CloseIcon from '@mui/icons-material/Close';
import { Box, Drawer, IconButton, Typography } from '@mui/material';
import React from 'react';
import FormJsonPanel from './FormJsonPanel';

interface Props {
  jsonString: string;
  open: boolean;
  onClose: () => void;
  readOnly?: boolean;
  onChange?: (value: string) => void;
  footer?: React.ReactNode;
}

const FormJsonDrawer: React.FC<Props> = ({
  jsonString,
  open,
  onClose,
  readOnly = true,
  onChange,
  footer,
}) => {
  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
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
          onClick={onClose}
          sx={{ color: 'grayscale.light' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Box flex={1} minHeight={0}>
        <FormJsonPanel
          value={jsonString}
          readOnly={readOnly}
          onChange={onChange}
        />
      </Box>
      {footer}
    </Drawer>
  );
};

export default FormJsonDrawer;
