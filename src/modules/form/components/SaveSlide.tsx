import { Box, LinearProgress, Paper, Slide, SlideProps } from '@mui/material';
import { first } from 'lodash-es';
import { useEffect, useRef, useState } from 'react';

interface Props extends SlideProps {
  loading?: boolean;
  padBody?: boolean;
}

const SaveSlide = ({
  children,
  loading = false,
  padBody = false,
  ...props
}: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!padBody) return;
    const currentElem = ref.current;
    if (!currentElem) return;

    const observer = new ResizeObserver((entries) => {
      const entry = first(entries);
      if (entry?.contentRect) setHeight(entry.contentRect.height);
    });

    observer.observe(currentElem);
    return () => observer.unobserve(currentElem);
  }, [padBody]);

  return (
    <>
      {height > 0 && (
        <style>{`html { scroll-padding-bottom: ${height}px }`}</style>
      )}
      <Slide {...props} ref={ref}>
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
    </>
  );
};

export default SaveSlide;
