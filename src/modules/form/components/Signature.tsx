import { Grid, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import DatePicker from '@/components/elements/input/DatePicker';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import TextInput from '@/components/elements/input/TextInput';
import theme from '@/config/theme';
import InputContainer from '@/modules/form/components/InputContainer';
import RequiredLabel from '@/modules/form/components/RequiredLabel';
import { DynamicInputCommonProps } from '@/modules/form/types';

type ValueProps = {
  signature: string;
  checked?: boolean;
  date?: Date;
};

type SignatureProps = {
  whoseSignature: string;
  value: ValueProps;
  onChange: (value: ValueProps) => any;
  themeColor?: string;
} & DynamicInputCommonProps;

const Signature = ({
  whoseSignature,
  value,
  onChange,
  themeColor = theme.palette.primary.main,
}: SignatureProps) => {
  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        borderWidth: '6px',
        borderStyle: 'none none none solid',
        borderColor: themeColor,
      }}
    >
      <Stack spacing={2}>
        <RequiredLabel
          text={whoseSignature}
          required={true}
          TypographyProps={{ variant: 'h5', color: themeColor }}
          requiredTypographyProps={{ variant: 'body1', fontWeight: '600' }}
        />
        <InputContainer horizontal={true} sx={{}}>
          <Grid container direction='row' spacing={2}>
            <Grid item sm={12} md={8}>
              <Typography variant='body1'>Full Name</Typography>
              <TextInput
                value={value.signature}
                placeholder='Signer name'
                aria-label={whoseSignature + ' signature'}
                onChange={(e) =>
                  onChange({
                    ...value,
                    signature: (e.target as HTMLInputElement).value,
                  })
                }
              />
            </Grid>
            <Grid item sm={12} md={4}>
              <Typography variant='body1'>Today's Date</Typography>
              <DatePicker
                onChange={(dateValue) =>
                  onChange({
                    ...value,
                    date: dateValue || undefined,
                  })
                }
                value={value.date || null}
                aria-label={whoseSignature + ' signature date'}
              />
            </Grid>
          </Grid>
        </InputContainer>
        <LabeledCheckbox
          label='I do hereby certify that the above information is true, accurate and complete to the best of my knowledge'
          checked={!!value.checked}
          onChange={(e) =>
            onChange({
              ...value,
              checked: (e.target as HTMLInputElement).checked,
            })
          }
          aria-label={whoseSignature + ' signature consent'}
        />
      </Stack>
    </Box>
  );
};

export default Signature;
