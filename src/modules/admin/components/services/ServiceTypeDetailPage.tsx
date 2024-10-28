import { Alert, Paper, Stack } from '@mui/material';
import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { CommonUnstyledList } from '@/components/CommonUnstyledList';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import EditIconButton from '@/components/elements/EditIconButton';
import Loading from '@/components/elements/Loading';
import RouterLink from '@/components/elements/RouterLink';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import ServiceTypeDialog from '@/modules/admin/components/services/ServiceTypeDialog';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import { AdminDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
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

  const {
    data: { serviceType } = {},
    loading,
    error,
  } = useGetServiceTypeDetailsQuery({
    variables: { id: serviceTypeId },
  });

  const navigate = useNavigate();

  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);

  if (error) throw error;
  if (!serviceType && loading) return <Loading />;
  if (!serviceType) return <NotFound />;

  return (
    <>
      <PageTitle
        overlineText={`${serviceType.hud ? 'View' : 'Manage'} Service`}
        title={serviceType.name}
        endElement={
          !serviceType.hud && (
            <EditIconButton
              title='Edit Service Type'
              onClick={() => setUpdateDialogOpen(true)}
              sx={{ ml: 1, mb: 0.5 }}
            />
          )
        }
        actions={
          !serviceType.hud && (
            <DeleteMutationButton<
              DeleteServiceTypeMutation,
              DeleteServiceTypeMutationVariables
            >
              queryDocument={DeleteServiceTypeDocument}
              variables={{ id: serviceType.id }}
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
          )
        }
      />
      {serviceType && (
        <ServiceTypeDialog
          serviceType={serviceType}
          dialogOpen={updateDialogOpen}
          closeDialog={() => setUpdateDialogOpen(!updateDialogOpen)}
        />
      )}
      <Stack gap={2}>
        {serviceType.formDefinitions.length === 0 && (
          <Alert severity='info'>
            To enable this service in a project, visit{' '}
            <RouterLink to={generatePath(AdminDashboardRoutes.FORMS)}>
              Forms
            </RouterLink>
            , create or choose the form that will collect this service, and
            enable it using a Form Rule.
          </Alert>
        )}
        <Paper sx={{ p: 2 }}>
          <Stack gap={1}>
            <CommonLabeledTextBlock title='Service Type Name'>
              {serviceType.name}
            </CommonLabeledTextBlock>
            <CommonLabeledTextBlock title='Service Category'>
              {serviceType.serviceCategory.name}
            </CommonLabeledTextBlock>
            <CommonLabeledTextBlock title='Supports Bulk Assignment?'>
              {serviceType.supportsBulkAssignment ? 'Yes' : 'No'}
            </CommonLabeledTextBlock>

            {serviceType.hudRecordType && (
              <CommonLabeledTextBlock title='HUD Record Type'>
                {HmisEnums.RecordType[serviceType.hudRecordType]}
              </CommonLabeledTextBlock>
            )}
            {serviceType.hudTypeProvided && (
              <CommonLabeledTextBlock title='HUD Type Provided'>
                {HmisEnums.ServiceTypeProvided[serviceType.hudTypeProvided]}
              </CommonLabeledTextBlock>
            )}

            <CommonLabeledTextBlock title='Active Forms'>
              <CommonUnstyledList>
                {serviceType.formDefinitions.length === 0 && 'No active forms'}
                {serviceType.formDefinitions.map((formDef) => (
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
