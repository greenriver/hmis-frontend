import { Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

const PageTitle = ({
  title,
  actions,
}: {
  title: ReactNode;
  actions?: ReactNode;
}) => {
  return (
    <Stack
      gap={3}
      direction='row'
      justifyContent={'space-between'}
      sx={{
        mb: 3,
        pr: 1,
        alignItems: 'center',
        // fixed height so its the same whether there are actions or not
        height: '40px',
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
