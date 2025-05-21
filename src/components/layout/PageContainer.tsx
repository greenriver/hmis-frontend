import { Container, ContainerProps, Stack } from '@mui/system';
import { ReactNode } from 'react';
import PageTitle from '@/components/layout/PageTitle';
import { useIsMobile } from '@/hooks/useIsMobile';

const PageContainer = ({
  children,
  title,
  overlineText,
  actions,
  maxWidth = 'lg',
}: {
  children: ReactNode;
  title: ReactNode;
  overlineText?: string;
  actions?: ReactNode;
  maxWidth?: ContainerProps['maxWidth'];
}) => {
  const isTiny = useIsMobile('sm');
  return (
    <Container
      component='main'
      maxWidth={maxWidth}
      sx={{ px: { xs: 1, sm: 3, lg: 4 }, pt: 4, pb: 6 }}
    >
      <Stack
        spacing={2}
        direction={isTiny ? 'column' : 'row'}
        justifyContent='space-between'
        sx={{ mb: { xs: actions ? 2 : 0, sm: 4 } }}
        alignItems={isTiny ? 'left' : 'center'}
      >
        <PageTitle
          overlineText={overlineText}
          title={title}
          actions={actions}
        />
      </Stack>

      {children}
    </Container>
  );
};
export default PageContainer;
