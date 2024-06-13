import { Stack, Typography } from '@mui/material';
import { StackProps } from '@mui/system';

interface Props extends StackProps {
  title: string;
  children: React.ReactNode;
  sx?: StackProps['sx'];
  action?: React.ReactNode;
}
const Section: React.FC<Props> = ({ title, children, sx, action }) => {
  return (
    <Stack gap={2} sx={sx}>
      <Typography variant='body1' fontWeight={600} component='h3'>
        {title}
        {action}
      </Typography>
      {children}
    </Stack>
  );
};
export default Section;
