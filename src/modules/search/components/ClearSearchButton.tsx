import ClearIcon from '@mui/icons-material/Clear';
import { Button, ButtonProps } from '@mui/material';
import React from 'react';

const ClearSearchButton: React.FC<ButtonProps> = (props) => {
  return (
    <Button
      variant='gray'
      startIcon={<ClearIcon />}
      {...props}
      sx={{ px: 3, ...props.sx }}
    >
      {props.children || <>Clear Search</>}
    </Button>
  );
};

export default ClearSearchButton;
