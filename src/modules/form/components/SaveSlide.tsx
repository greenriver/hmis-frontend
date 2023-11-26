import { Box, LinearProgress, Paper, Slide, SlideProps } from '@mui/material';

interface Props extends SlideProps {
  loading?: boolean;
}

const SaveSlide = ({ children, loading = false, ...props }: Props) => (
  <Slide {...props}>
    <div>
      {loading ? (
        <LinearProgress
          sx={{ height: 2 }}
          aria-live='polite'
          aria-busy='true'
        />
      ) : (
        <Box sx={{ height: 2 }} />
      )}
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
    </div>
  </Slide>
);

export default SaveSlide;
