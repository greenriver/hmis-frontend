import CheckIcon from '@mui/icons-material/Check';
import { Box, Stack, Typography } from '@mui/material';
import { compact, uniq } from 'lodash-es';
import { useState } from 'react';

import { ColumnDef } from '../../../components/elements/GenericTable';

import { useProjectDashboardContext } from './ProjectDashboard';
import { InactiveChip } from './ProjectOverview';
import {
  ENROLLMENT_COLUMNS,
  EnrollmentFields,
} from './tables/ProjectClientEnrollmentsTable';

import LoadingButton from '@/components/elements/LoadingButton';
import useSafeParams from '@/hooks/useSafeParams';
import BulkAdd from '@/modules/bulk/components/BulkAdd';
import ProjectEnrollmentsTable from '@/modules/projects/components/tables/ProjectEnrollmentsTable';
import {
  AddServiceToEnrollmentDocument,
  AddServiceToEnrollmentMutation,
  AddServiceToEnrollmentMutationVariables,
  FormRole,
} from '@/types/gqlTypes';

const tableColumns: ColumnDef<EnrollmentFields>[] = [
  ENROLLMENT_COLUMNS.clientNameLinkedToEnrollment,
  ENROLLMENT_COLUMNS.clientId,
  ENROLLMENT_COLUMNS.householdId,
  ENROLLMENT_COLUMNS.dobAge,
  ENROLLMENT_COLUMNS.enrollmentPeriod,
];

const BulkAddServices = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };
  const title = 'Record Services';
  const { project } = useProjectDashboardContext();
  const [loadingEnrollmentIds, setLoadingEnrollmentIds] = useState<string[]>(
    []
  );
  const [enrollmentsAdded, setEnrollmentsAdded] = useState<string[]>([]);

  return (
    <BulkAdd<
      EnrollmentFields,
      AddServiceToEnrollmentMutation,
      AddServiceToEnrollmentMutationVariables
    >
      mutationDocument={AddServiceToEnrollmentDocument}
      renderList={(items, { onSelect, mutationLoading, values }) => (
        <>
          {(!values?.dateProvided || !values?.typeProvided) && (
            <Typography>
              Select a service type and service date to begin.
            </Typography>
          )}
          {values?.dateProvided && values?.typeProvided && (
            <ProjectEnrollmentsTable
              mode='clients'
              projectId={projectId}
              openOnDate={values.dateProvided}
              linkRowToEnrollment={false}
              columns={[
                ...tableColumns,
                ...items.map((item) => ({
                  header: item.label,
                  render: (enrollment: EnrollmentFields) =>
                    item.getNode(enrollment, {
                      disabled: enrollmentsAdded.includes(enrollment.id),
                    }),
                })),
                {
                  header: '',
                  render: (enrollment: EnrollmentFields) => (
                    <Box sx={{ textAlign: 'right' }}>
                      <LoadingButton
                        color='secondary'
                        onClick={() => {
                          onSelect(enrollment);
                          setLoadingEnrollmentIds((ids) => [
                            ...ids,
                            enrollment.id,
                          ]);
                        }}
                        disabled={
                          loadingEnrollmentIds.includes(enrollment.id) ||
                          enrollmentsAdded.includes(enrollment.id)
                        }
                        loading={
                          mutationLoading &&
                          loadingEnrollmentIds.includes(enrollment.id)
                        }
                        startIcon={
                          enrollmentsAdded.includes(enrollment.id) ? (
                            <CheckIcon />
                          ) : undefined
                        }
                      >
                        {enrollmentsAdded.includes(enrollment.id)
                          ? 'Assigned'
                          : 'Assign'}
                      </LoadingButton>
                    </Box>
                  ),
                },
              ]}
            />
          )}
        </>
      )}
      formRole={FormRole.Service}
      getInputFromTarget={(formData, enrollment) => ({
        // We should be hitting `SubmitForm` and constructing `SubmitFormValues` here
        input: {
          input: { ...formData, enrollmentId: enrollment.id },
        },
      })}
      getKeyForTarget={(enrollment) => enrollment.id}
      getErrors={(data) => data.createService?.errors}
      onSuccess={(enrollment, data) => {
        const service = data?.createService?.service;

        if (service)
          setEnrollmentsAdded((added) =>
            uniq(compact([...added, enrollment.id]))
          );
      }}
      onCompleted={(enrollment) =>
        setLoadingEnrollmentIds((ids) =>
          ids.filter((id) => id !== enrollment.id)
        )
      }
      title={
        <Stack direction={'row'} spacing={2}>
          <Typography variant='h3' sx={{ pt: 0, mt: 0 }}>
            {title}
          </Typography>
          <InactiveChip project={project} />
        </Stack>
      }
    />
  );
};
export default BulkAddServices;
