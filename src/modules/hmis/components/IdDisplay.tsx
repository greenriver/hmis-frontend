import { Typography, TypographyProps } from '@mui/material';

interface Props extends TypographyProps {
  id?: string;
}

const IdDisplay = ({ id, ...props }: Props) => {
  return (
    <Typography variant='body2' color='text.disabled' {...props}>
      ID: {id}
    </Typography>
  );
};

export default IdDisplay;
