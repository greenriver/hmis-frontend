import { Box, LinearProgress, Paper, Slide, SlideProps } from '@mui/material';

interface Props extends SlideProps {
  loading?: boolean;
}

const SaveSlide = ({ children, loading = false, ...props }: Props) => (
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
        zIndex: (theme) => theme.zIndex.drawer,
        boxShadow: '0 0 10px rgb(0 0 0 / 25%)',
        clipPath: 'inset(-10px -1px 0px -1px)',
      }}
    >
      <Box sx={{ width: '100%' }}>
        {loading ? (
          <LinearProgress
            sx={{ height: 2 }}
            aria-live='polite'
            aria-busy='true'
          />
        ) : (
          <Box sx={{ height: 2 }} />
        )}
        <Box sx={{ p: 2 }}>{children}</Box>
      </Box>
    </Paper>
  </Slide>
);

export default SaveSlide;
