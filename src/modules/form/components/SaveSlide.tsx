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
        backgroundColor: 'white',
        py: 2,
        px: 2,
        zIndex: (theme) => theme.zIndex.drawer,
        boxShadow: '0 0 10px rgb(0 0 0 / 25%)',
        clipPath: 'inset(-10px -1px 0px -1px)',
      }}
    >
      <Box sx={{ width: '100%' }}>{children}</Box>
    </Paper>
  </Slide>
);

export default SaveSlide;
