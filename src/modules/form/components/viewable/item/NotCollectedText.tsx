import { Typography, TypographyProps } from '@mui/material';
import { ReactNode } from 'react';

export interface NotCollectedTextProps extends TypographyProps {
  children?: ReactNode;
}

const NotCollectedText = ({
  children = 'Not Provided',
  ...props
}: NotCollectedTextProps): JSX.Element => {
  return (
    <Typography color='text.disabled' {...props}>
      {children}
    </Typography>
  );
};

export default NotCollectedText;
