import { Typography, TypographyProps } from '@mui/material';

interface Props extends TypographyProps {
  prefix?: string;
  id?: string;
  withoutEmphasis?: boolean;
}

const IdDisplay = ({ id, prefix, withoutEmphasis, ...props }: Props) => {
  return (
    <Typography variant='body2' color='text.disabled' {...props}>
      {prefix ? `${prefix} ` : ''} ID: {withoutEmphasis ? id : <b>{id}</b>}
    </Typography>
  );
};

export default IdDisplay;
