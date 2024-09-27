import { Paper, Stack } from '@mui/material';
import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { AdminDashboardRoutes } from '@/app/routes';
import { CommonUnstyledList } from '@/components/CommonUnstyledList';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import EditIconButton from '@/components/elements/EditIconButton';
import Loading from '@/components/elements/Loading';
import RouterLink from '@/components/elements/RouterLink';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import UpdateServiceTypeDialog from '@/modules/admin/components/services/UpdateServiceTypeDialog';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import {
  DeleteServiceTypeDocument,
  DeleteServiceTypeMutation,
  DeleteServiceTypeMutationVariables,
  useGetServiceTypeDetailsQuery,
} from '@/types/gqlTypes';
import { evictQuery } from '@/utils/cacheUtil';
import { generateSafePath } from '@/utils/pathEncoding';

const ServiceTypeDetailPage = () => {
  const { serviceTypeId } = useSafeParams() as {
    serviceTypeId: string;
  };

  const { data, loading, error } = useGetServiceTypeDetailsQuery({
    variables: { id: serviceTypeId },
  });

  const navigate = useNavigate();

  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  if (error) throw error;
  if (!data && loading) return <Loading />;
  if (!data?.serviceType) return <NotFound />;

  return (
    <>
      <PageTitle
        overlineText='Manage Service'
        title={data.serviceType.name}
        endElement={
          <EditIconButton
            title='Edit Service Type'
            onClick={() => setUpdateDialogOpen(true)}
            sx={{ ml: 1, mb: 0.5 }}
          />
        }
        actions={
          <DeleteMutationButton<
            DeleteServiceTypeMutation,
            DeleteServiceTypeMutationVariables
          >
            queryDocument={DeleteServiceTypeDocument}
            variables={{ id: data.serviceType.id }}
            idPath={'deleteServiceType.serviceType.id'}
            recordName='Service Type'
            onSuccess={() => {
              evictQuery('serviceTypes');
              navigate(
                generateSafePath(AdminDashboardRoutes.CONFIGURE_SERVICES)
              );
            }}
          >
            Delete
          </DeleteMutationButton>
        }
      />
      {data.serviceType && (
        <UpdateServiceTypeDialog
          serviceType={data.serviceType}
          dialogOpen={updateDialogOpen}
          closeDialog={() => setUpdateDialogOpen(!updateDialogOpen)}
        />
      )}
      <Stack gap={2}>
        <Paper sx={{ p: 2 }}>
          <Stack gap={1}>
            <CommonLabeledTextBlock title='Service Category'>
              {data.serviceType.category}
            </CommonLabeledTextBlock>
            <CommonLabeledTextBlock title='Service Type'>
              {data.serviceType.name}
            </CommonLabeledTextBlock>
            <CommonLabeledTextBlock title='Supports Bulk Assignment?'>
              {data.serviceType.supportsBulkAssignment ? 'Yes' : 'No'}
            </CommonLabeledTextBlock>
            <CommonLabeledTextBlock title='Active Forms'>
              <CommonUnstyledList>
                {data.serviceType.formDefinitions.map((formDef) => (
                  <li key={formDef.id}>
                    <RouterLink
                      to={generatePath(AdminDashboardRoutes.VIEW_FORM, {
                        identifier: formDef.identifier,
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
