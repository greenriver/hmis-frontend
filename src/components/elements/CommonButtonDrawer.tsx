import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Button,
  ButtonProps,
  Divider,
  Drawer,
  IconButton,
  Typography,
} from '@mui/material';
import React, { ReactElement } from 'react';

interface Props {
  title: string;
  icon: ButtonProps['startIcon'];
  // Specify that this component's child can accept `onClose` as a prop.
  // If it does, this component, which manages the drawer open/close state, will pass it down.
  // This avoids lifting state up into the parent
  children?: ReactElement<{ onClose?: () => void }>;
}

const CommonButtonDrawer: React.FC<Props> = ({ title, icon, children }) => {
  const [open, setOpen] = React.useState(false);

  const handleClose = () => setOpen(false);

  return (
    <>
      <Button
        variant='text'
        color='grayscale'
        startIcon={icon}
        onClick={() => setOpen(true)}
      >
        {title}
      </Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        anchor='right'
        sx={{
          '& .MuiDrawer-paper': {
            borderTop: 'none',
            width: '500px',
            maxWidth: '100%',
          },
        }}
      >
        <Typography p={2} component='h2' variant='h5'>
          {title}
        </Typography>
        <IconButton
          aria-label='close'
          onClick={() => setOpen(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grayscale.light',
          }}
        >
          <CloseIcon />
        </IconButton>
        <Divider orientation='horizontal' flexItem />
        <Box p={2}>
          {children && React.cloneElement(children, { onClose: handleClose })}
        </Box>
      </Drawer>
    </>
  );
};

export default CommonButtonDrawer;
