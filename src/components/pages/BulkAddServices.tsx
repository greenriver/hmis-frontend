import CheckIcon from '@mui/icons-material/Check';
import {
  Button,
  CircularProgress,
  Stack,
  Typography,
  Box,
} from '@mui/material';
import { compact, uniq } from 'lodash-es';
import { useState } from 'react';

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
  const title = 'Record Services';
  const [crumbs, crumbsLoading, project] = useProjectCrumbs(title);
  const [workingEnrollmentId, setWorkingEnrollmentId] = useState<
    string | undefined
  >();
  const [enrollmentsAdded, setEnrollmentsAdded] = useState<string[]>([]);

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
        renderList={(items, { onSelect, mutationLoading }) => (
          <ProjectEnrollmentsTable
            noLinks
            projectId={projectId}
            additionalColumns={[
              ...items.map(
                (item) =>
                  ({
                    header: item.label,
                    render: (enrollment) =>
                      item.getNode(enrollment, {
                        disabled: enrollmentsAdded.includes(enrollment.id),
                      }),
                  } as ColumnDef<EnrollmentFieldsFragment>)
              ),
              {
                header: '',
                render: (enrollment) => (
                  <Box sx={{ textAlign: 'right' }}>
                    <Button
                      color='secondary'
                      onClick={() => {
                        onSelect(enrollment);
                        setWorkingEnrollmentId(enrollment.id);
                      }}
                      disabled={enrollmentsAdded.includes(enrollment.id)}
                      startIcon={
                        mutationLoading &&
                        workingEnrollmentId === enrollment.id ? (
                          <CircularProgress color='inherit' size={15} />
                        ) : enrollmentsAdded.includes(enrollment.id) ? (
                          <CheckIcon />
                        ) : undefined
                      }
                    >
                      {enrollmentsAdded.includes(enrollment.id)
                        ? 'Assigned'
                        : 'Assign'}
                    </Button>
                  </Box>
                ),
              },
            ]}
          />
        )}
        definitionIdentifier='service'
        getInputFromItem={(formData, enrollment) => ({
          input: {
            input: { ...formData, enrollmentId: enrollment.id },
          },
        })}
        getKeyForItem={(enrollment) => enrollment.id}
        getErrors={(data) => data.createService?.errors}
        onCompleted={(data) => {
          const service = data?.createService?.service;

          if (service)
            setEnrollmentsAdded(
              uniq(compact([...enrollmentsAdded, workingEnrollmentId]))
            );
          setWorkingEnrollmentId(undefined);
        }}
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
