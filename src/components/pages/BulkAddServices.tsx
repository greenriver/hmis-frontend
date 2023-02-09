import CheckIcon from '@mui/icons-material/Check';
import { LoadingButton } from '@mui/lab';
import { Box, Stack, Typography } from '@mui/material';
import { compact, uniq } from 'lodash-es';
import { useState } from 'react';

import ClientName from '../elements/ClientName';
import { ColumnDef } from '../elements/GenericTable';
import Loading from '../elements/Loading';

import { InactiveChip } from './Project';

import useSafeParams from '@/hooks/useSafeParams';
import BulkAdd from '@/modules/bulk/components/BulkAdd';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import ProjectEnrollmentsTable from '@/modules/inventory/components/ProjectEnrollmentsTable';
import ProjectLayout from '@/modules/inventory/components/ProjectLayout';
import { useProjectCrumbs } from '@/modules/inventory/components/useProjectCrumbs';
import { DashboardRoutes } from '@/routes/routes';
import {
  AddServiceToEnrollmentDocument,
  AddServiceToEnrollmentMutation,
  AddServiceToEnrollmentMutationVariables,
  EnrollmentFieldsFragment,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const tableColumns: ColumnDef<EnrollmentFieldsFragment>[] = [
  {
    header: 'Client',
    render: (e) => (
      <ClientName
        client={e.client}
        routerLinkProps={{
          to: generateSafePath(DashboardRoutes.VIEW_ENROLLMENT, {
            clientId: e.client.id,
            enrollmentId: e.id,
          }),
          target: '_blank',
        }}
      />
    ),
    linkTreatment: true,
  },
  {
    header: 'Enrollment Period',
    render: (e) => parseAndFormatDateRange(e.entryDate, e.exitDate),
  },
  {
    header: 'Household Size',
    render: 'householdSize',
  },
];

const BulkAddServices = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };
  const title = 'Record Services';
  const [crumbs, crumbsLoading, project] = useProjectCrumbs(title);
  const [loadingEnrollmentIds, setLoadingEnrollmentIds] = useState<string[]>(
    []
  );
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
        renderList={(items, { onSelect, mutationLoading, values }) => (
          <>
            {(!values?.dateProvided || !values?.typeProvided) && (
              <Typography>
                Select a service type and service date to begin.
              </Typography>
            )}
            {values?.dateProvided && values?.typeProvided && (
              <ProjectEnrollmentsTable
                projectId={projectId}
                openOnDate={values.dateProvided}
                linkRowToEnrollment={false}
                columns={[
                  ...tableColumns,
                  ...items.map((item) => ({
                    header: item.label,
                    render: (enrollment: EnrollmentFieldsFragment) =>
                      item.getNode(enrollment, {
                        disabled: enrollmentsAdded.includes(enrollment.id),
                      }),
                  })),
                  {
                    header: '',
                    render: (enrollment: EnrollmentFieldsFragment) => (
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
        definitionIdentifier='service'
        getInputFromTarget={(formData, enrollment) => ({
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
    </ProjectLayout>
  );
};
export default BulkAddServices;
