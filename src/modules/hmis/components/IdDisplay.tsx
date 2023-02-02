import { Typography, TypographyProps } from '@mui/material';

interface Props extends TypographyProps {
  prefix?: string;
  id?: string;
}

const IdDisplay = ({ id, prefix, ...props }: Props) => {
  return (
    <Typography variant='body2' color='text.disabled' {...props}>
      {prefix ? `${prefix} ` : ''} ID: <b>{id}</b>
    </Typography>
  );
};

export default IdDisplay;
