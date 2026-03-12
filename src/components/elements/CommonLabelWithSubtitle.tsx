import { Box, Stack } from '@mui/material';

interface Props {
  label: string;
  subtitle?: string;
}

const CommonLabelWithSubtitle: React.FC<Props> = ({ label, subtitle }) => (
  <Stack>
    <span>{label}</span>
    {subtitle && (
      <Box
        component='span'
        fontWeight={400}
        fontStyle='italic'
        color='text.secondary'
      >
        {subtitle}
      </Box>
    )}
  </Stack>
);

export default CommonLabelWithSubtitle;
