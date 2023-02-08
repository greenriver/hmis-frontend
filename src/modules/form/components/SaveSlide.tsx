import { Box, Paper, Slide, SlideProps } from '@mui/material';

type Props = SlideProps;

const SaveSlide = ({ children, ...props }: Props) => (
  <Slide {...props}>
    <Paper
      elevation={2}
      square
      sx={{
        position: 'sticky',
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row-reverse',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        py: 1,
        px: 2,
        pointerEvents: 'auto', // disallow clicking "through" the banner
      }}
    >
      <Box sx={{ width: '100%' }}>{children}</Box>
    </Paper>
  </Slide>
);

export default SaveSlide;
