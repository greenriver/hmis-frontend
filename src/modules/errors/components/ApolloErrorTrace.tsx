import { Box } from '@mui/material';
import { CommonUnstyledList } from '@/components/CommonUnstyledList';

interface ErrorWithBacktrace extends Error {
  backtrace?: string[];
}
interface Props {
  errors: ErrorWithBacktrace[];
}
const ApolloErrorTrace: React.FC<Props> = ({ errors }) => {
  if (import.meta.env.MODE !== 'development') return null;
  if (!errors.some((e) => e.backtrace)) return null;

  return (
    <Box
      sx={{
        fontFamily: 'Monospace',
        display: 'block',
        p: 2,
        background: '#fff',
        color: '#555',
        overflowY: 'auto',
        maxHeight: 'calc(100vh - 200px)',
      }}
    >
      {errors.map((e) => (
        <CommonUnstyledList key={JSON.stringify(e)}>
          {(e?.backtrace || []).map((line) => (
            <li>{line}</li>
          ))}
        </CommonUnstyledList>
      ))}
    </Box>
  );
};

export default ApolloErrorTrace;
