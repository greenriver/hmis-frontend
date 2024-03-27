import { IconButton, Paper, Stack, Typography } from '@mui/material';
import { generatePath } from 'react-router-dom';
import { CommonUnstyledList } from '@/components/CommonUnstyledList';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import RouterLink from '@/components/elements/RouterLink';
import { EditIcon } from '@/components/elements/SemanticIcons';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { AdminDashboardRoutes } from '@/routes/routes';
import { useGetServiceTypeDetailsQuery } from '@/types/gqlTypes';

const ServiceTypeDetailPage = () => {
  const { serviceTypeId } = useSafeParams() as {
    serviceTypeId: string;
  };

  const { data, loading, error } = useGetServiceTypeDetailsQuery({
    variables: { id: serviceTypeId },
  });

  if (error) throw error;
  if (!data && loading) return <Loading />;
  if (!data?.serviceType) return <NotFound />;

  return (
    <>
      <PageTitle
        title={
          <Stack direction='row' gap={1}>
            <Typography variant='h3'>
              Manage Service: <b>{data.serviceType.name}</b>
            </Typography>
            <IconButton
              aria-label='edit title'
              // TODO: bring up dialog to edit service name
              // eslint-disable-next-line no-console
              onClick={() => null}
              size='small'
            >
              <EditIcon fontSize='inherit' />
            </IconButton>
          </Stack>
        }
      />
      <Stack gap={2}>
        <Paper sx={{ p: 2 }}>
          <Stack gap={1}>
            <CommonLabeledTextBlock title='Service Category'>
              {data.serviceType.category}
            </CommonLabeledTextBlock>
            <CommonLabeledTextBlock title='Service Type'>
              {data.serviceType.name}
            </CommonLabeledTextBlock>
            <CommonLabeledTextBlock title='Active Forms'>
              <CommonUnstyledList>
                {data.serviceType.formDefinitions.map((formDef) => (
                  <li>
                    <RouterLink
                      to={generatePath(AdminDashboardRoutes.VIEW_FORM, {
                        formId: formDef.id,
                      })}
                      openInNew
                    >
                      {formDef.title}
                    </RouterLink>
                  </li>
                ))}
              </CommonUnstyledList>
            </CommonLabeledTextBlock>
          </Stack>
        </Paper>
      </Stack>
    </>
  );
};

export default ServiceTypeDetailPage;
