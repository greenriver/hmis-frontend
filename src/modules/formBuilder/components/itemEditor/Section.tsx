import { Divider, Stack, Typography } from '@mui/material';
import { StackProps } from '@mui/system';

interface Props extends StackProps {
  title: string;
  children: React.ReactNode;
  sx?: StackProps['sx'];
  action?: React.ReactNode;
  hidden?: boolean;
  noDivider?: boolean;
}
const Section: React.FC<Props> = ({
  title,
  children,
  sx,
  action,
  hidden = false,
  noDivider = false,
}) => {
  if (hidden) return null;

  return (
    <>
      <Stack gap={2} sx={{ pb: noDivider ? 0 : 3, pt: 2, ...sx }}>
        <Typography variant='body1' fontWeight={600} component='h3'>
          {title}
          {action}
        </Typography>
        {children}
      </Stack>
      {!noDivider && <Divider />}
    </>
  );
};
export default Section;
