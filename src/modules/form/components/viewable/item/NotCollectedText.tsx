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
    <Typography
      {...props}
      sx={({ palette }) =>
        Object.assign({
          color: palette.text.disabled,
          ...(props.sx ? props.sx : {}),
        })
      }
    >
      {children}
    </Typography>
  );
};

export default NotCollectedText;
