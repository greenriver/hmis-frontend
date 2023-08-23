import { Typography, TypographyProps } from '@mui/material';
import { ReactNode } from 'react';

export interface NotCollectedTextProps extends TypographyProps {
  children?: ReactNode;
}

const NotCollectedText = ({
  children = 'Data not collected',
  ...props
}: NotCollectedTextProps): JSX.Element => {
  return (
    <Typography
      color='text.disabled'
      variant='inherit'
      className='HmisForm-notCollectedText'
      {...props}
    >
      {children}
    </Typography>
  );
};

export default NotCollectedText;
