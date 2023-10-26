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
    <Stack direction='row' spacing={1} component='span'>
      <Typography variant='body2' {...TypographyProps} component='span'>
        {text}
      </Typography>
      {required && (
        <Typography variant='body2' color='error' component='span'>
          (Required)
        </Typography>
      )}
    </Stack>
  );
};

export const getRequiredLabel = (text: string, required?: boolean) => {
  return (
    <RequiredLabel
      text={text}
      required={required}
      TypographyProps={{
        fontWeight: 600,
      }}
    />
  );
};

export default RequiredLabel;
