import {
  DialogActions,
  DialogContent,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import * as React from 'react';
import { useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { CommonUnstyledList } from '@/components/CommonUnstyledList';
import CommonDialog from '@/components/elements/CommonDialog';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import TextInput from '@/components/elements/input/TextInput';
import Loading from '@/components/elements/Loading';
import RouterLink from '@/components/elements/RouterLink';
import { EditIcon } from '@/components/elements/SemanticIcons';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import FormActions from '@/modules/form/components/FormActions';
import { AdminDashboardRoutes } from '@/routes/routes';
import {
  DeleteServiceTypeDocument,
  DeleteServiceTypeMutation,
  DeleteServiceTypeMutationVariables,
  useGetServiceTypeDetailsQuery,
  useRenameServiceTypeMutation,
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

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState<string>();

  const [renameServiceType, { error: renameError, loading: renameLoading }] =
    useRenameServiceTypeMutation({
      variables: { id: data?.serviceType?.id || '', name: editedName || '' },
      onCompleted: () => setEditDialogOpen(false),
    });

  if (error) throw error;
  if (!data && loading) return <Loading />;
  if (!data?.serviceType) return <NotFound />;
  if (renameError) throw renameError;

  return (
    <>
      <PageTitle
        title={
          <Stack direction='row' gap={1} key={data.serviceType.name}>
            <Typography variant='h3'>
              Manage Service: <b>{data.serviceType.name}</b>
            </Typography>
            <IconButton
              aria-label='edit title'
              onClick={() => setEditDialogOpen(true)}
              size='small'
            >
              <EditIcon fontSize='inherit' />
            </IconButton>
          </Stack>
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
      <CommonDialog open={editDialogOpen}>
        <DialogTitle>Edit Service Type</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextInput
            label='Name'
            value={
              editedName || editedName === ''
                ? editedName
                : data?.serviceType?.name
            }
            onChange={(e) => setEditedName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <FormActions
            onSubmit={() => renameServiceType()}
            loading={renameLoading}
            onDiscard={() => setEditDialogOpen(false)}
          />
        </DialogActions>
      </CommonDialog>
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
