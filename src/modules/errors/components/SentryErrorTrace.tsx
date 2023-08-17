import { Typography } from '@mui/material';

const SentryErrorTrace = ({
  error,
  componentStack,
}: {
  error: Error;
  componentStack: string | null;
}) => (
  <>
    <Typography variant='body2' sx={{ fontFamily: 'Monospace', my: 2 }}>
      {error.toString()}
    </Typography>
    {componentStack &&
      componentStack.split('\n').map((s, i) => (
        <Typography
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          variant='caption'
          sx={{ fontFamily: 'Monospace' }}
          display='block'
        >
          {s}
        </Typography>
      ))}
  </>
);
export default SentryErrorTrace;
