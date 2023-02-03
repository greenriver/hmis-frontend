import { Button, Stack, Typography } from '@mui/material';

import { ColumnDef } from '../elements/GenericTable';
import Loading from '../elements/Loading';

import { InactiveChip } from './Project';

import useSafeParams from '@/hooks/useSafeParams';
import BulkAdd from '@/modules/bulk/components/BulkAdd';
import ProjectEnrollmentsTable from '@/modules/inventory/components/ProjectEnrollmentsTable';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import {
  AddServiceToEnrollmentDocument,
  AddServiceToEnrollmentMutation,
  AddServiceToEnrollmentMutationVariables,
  EnrollmentFieldsFragment,
} from '@/types/gqlTypes';

const BulkAddServices = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };
  const title = 'Add Services';
  const [crumbs, crumbsLoading, project] = useProjectCrumbs(title);

  if (crumbsLoading) return <Loading />;
  if (!crumbs || !project) throw Error('Project not found');

  return (
    <ProjectLayout crumbs={crumbs}>
      <BulkAdd<
        EnrollmentFieldsFragment,
        AddServiceToEnrollmentMutation,
        AddServiceToEnrollmentMutationVariables
      >
        mutationDocument={AddServiceToEnrollmentDocument}
        renderList={(items, { onSelect }) => (
          <ProjectEnrollmentsTable
            noLinks
            projectId={projectId}
            additionalColumns={[
              ...items.map(
                (item) =>
                  ({
                    header: item.label,
                    render: (enrollment) => item.getNode(enrollment),
                  } as ColumnDef<EnrollmentFieldsFragment>)
              ),
              {
                header: '',
                render: (enrollment) => (
                  <Button
                    color='secondary'
                    onClick={() => onSelect(enrollment)}
                  >
                    Assign
                  </Button>
                ),
              },
            ]}
          />
        )}
        definitionIdentifier='service'
        getInputFromItem={(formData, enrollment) => ({
          input: { ...formData, enrollmentId: enrollment.id },
        })}
        getKeyForItem={(enrollment) => enrollment.id}
        getErrors={(data) => data.createService?.errors}
        onCompleted={console.log}
        title={
          <Stack direction={'row'} spacing={2}>
            <Typography variant='h3' sx={{ pt: 0, mt: 0 }}>
              {title}
            </Typography>
            <InactiveChip project={project} />
          </Stack>
        }
      />
    </ProjectLayout>
  );
};
export default BulkAddServices;
