import { Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

const PageTitle = ({
  title,
  actions,
}: {
  title: ReactNode;
  actions?: ReactNode;
}) => {
  const isTiny = useIsMobile('sm');

  return (
    <Stack
      gap={isTiny ? 1 : 3}
      direction={isTiny ? 'column' : 'row'}
      justifyContent={'space-between'}
      width={isTiny ? 'fit-content' : '100%'}
      sx={{
        mb: isTiny ? 1 : 3,
        alignItems: isTiny ? 'left' : 'center',
        // fixed height (if not mobile), so height is the same whether there are actions or not
        height: isTiny ? '' : '40px',
      }}
    >
      {typeof title === 'string' ? (
        <Typography variant='h3'>{title}</Typography>
      ) : (
        title
      )}
      {actions}
    </Stack>
  );
};

export default PageTitle;
