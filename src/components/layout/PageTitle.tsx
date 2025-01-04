import { Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

const PageTitle = ({
  title,
  overlineText,
  actions,
  endElement,
}: {
  title: ReactNode;
  overlineText?: string;
  endElement?: ReactNode; // element to appear directly to the right of the title
  actions?: ReactNode; // element to float to the right (e.g. action button)
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
        // fixed min height (if not mobile), so height is the same whether there are actions or not
        minHeight: isTiny ? '' : '40px',
      }}
    >
      {typeof title === 'string' ? (
        <Typography variant='h3' component='h1'>
          {overlineText ? (
            <Typography variant='overline' color='links' display='block'>
              {overlineText}
            </Typography>
          ) : null}
          {title}
          {endElement}
        </Typography>
      ) : (
        <>
          {title}
          {endElement}
        </>
      )}
      {actions}
    </Stack>
  );
};

export default PageTitle;
