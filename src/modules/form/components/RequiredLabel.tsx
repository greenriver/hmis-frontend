import { Stack, Typography, TypographyProps } from '@mui/material';

const RequiredLabel = ({
  text,
  required = false,
  TypographyProps,
}: {
  text: string;
  required?: boolean | null;
  TypographyProps?: TypographyProps;
}) => {
  return (
    <Stack direction='row' spacing={1}>
      <Typography variant='body2' {...TypographyProps}>
        {text}
      </Typography>
      {required && (
        <Typography variant='body2' color='error'>
          (Required)
        </Typography>
      )}
    </Stack>
  );
};
export default RequiredLabel;
