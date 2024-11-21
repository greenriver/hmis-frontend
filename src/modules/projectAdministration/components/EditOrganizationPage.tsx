import { Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useOrganizationCrumbs } from '../hooks/useOrganizationCrumbs';
import Loading from '@/components/elements/Loading';

import BasicBreadcrumbPageLayout from '@/components/layout/BasicBreadcrumbPageLayout';
import NotFound from '@/components/pages/NotFound';

import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import EditRecord from '@/modules/form/components/EditRecord';
import { OrganizationPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { Routes } from '@/routes/routes';
import {
  DeleteOrganizationDocument,
  DeleteOrganizationMutation,
  DeleteOrganizationMutationVariables,
  RecordFormRole,
  OrganizationFieldsFragment,
  PickListType,
} from '@/types/gqlTypes';
import { evictPickList, evictQuery } from '@/utils/cacheUtil';
import { generateSafePath } from '@/utils/pathEncoding';

const EditOrganizationPage = () => {
  const navigate = useNavigate();

  const { crumbs, loading, organization, organizationName } =
    useOrganizationCrumbs('Edit Organization');

  const onCompleted = useCallback(
    (data: OrganizationFieldsFragment) => {
      navigate(
        generateSafePath(Routes.ORGANIZATION, { organizationId: data.id })
      );
    },
    [navigate]
  );

  const onSuccessfulDelete = useCallback(() => {
    evictPickList(PickListType.Project);
    evictQuery('organizations');
    navigate(generateSafePath(Routes.ALL_PROJECTS));
  }, [navigate]);

  if (loading) return <Loading />;
  if (!crumbs || !organization) return <NotFound />;
  if (!organization.access.canEditOrganization) return <NotFound />;

  const organizationId = organization.id;
  return (
    <BasicBreadcrumbPageLayout crumbs={crumbs}>
      {loading && <Loading />}
      {organization && (
        <EditRecord<OrganizationFieldsFragment>
          formRole={RecordFormRole.Organization}
          record={organization}
          onCompleted={onCompleted}
          title={
            <Stack
              direction={'row'}
              // justifyContent='space-between'
              alignItems={'end'}
              gap={3}
              sx={{ my: 1 }}
            >
              <Stack direction={'row'} spacing={2}>
                <Typography variant='h3' sx={{ pt: 0, mt: 0 }}>
                  Edit {organizationName}
                </Typography>
              </Stack>
              <OrganizationPermissionsFilter
                id={organizationId}
                permissions={['canDeleteOrganization']}
              >
                <DeleteMutationButton<
                  DeleteOrganizationMutation,
                  DeleteOrganizationMutationVariables
                >
                  queryDocument={DeleteOrganizationDocument}
                  variables={{ input: { id: organizationId } }}
                  idPath='deleteOrganization.organization.id'
                  recordName='Organization'
                  onSuccess={onSuccessfulDelete}
                  ButtonProps={{ size: 'small' }}
                  deleteIcon
                >
                  Delete Organization
                </DeleteMutationButton>
              </OrganizationPermissionsFilter>
            </Stack>
          }
        />
      )}
    </BasicBreadcrumbPageLayout>
  );
};
export default EditOrganizationPage;
