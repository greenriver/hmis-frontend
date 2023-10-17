import { Stack, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';

import { HouseholdAssesmentRole, TabDefinition } from './util';

import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import AssessmentStatusIndicator from '@/modules/assessments/components/AssessmentStatusIndicator';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { AssessmentRole } from '@/types/gqlTypes';

interface Props {
  tabs: TabDefinition[];
  role: HouseholdAssesmentRole;
  setAssessmentsToSubmit: (assessmentIds: string[]) => void;
  setCurrentTab: Dispatch<SetStateAction<string | undefined>>;
}

const roleLabels = (role: HouseholdAssesmentRole) => {
  switch (role) {
    case AssessmentRole.Intake:
      return {
        dateHeader: 'Entry Date',
        statusHeader: 'Intake Assessment Status',
      };
    case AssessmentRole.Exit:
      return {
        dateHeader: 'Exit Date',
        statusHeader: 'Exit Assessment Status',
      };
    default:
      return {
        dateHeader: 'Assessment Date',
        statusHeader: 'Assessment Status',
      };
  }
};

const isSubmittable = (row: TabDefinition) =>
  !!(row.assessmentId && row.assessmentInProgress);

const HouseholdSummaryTable = ({
  tabs,
  role,
  setAssessmentsToSubmit,
}: Props) => {
  const columns: ColumnDef<TabDefinition>[] = useMemo(() => {
    const { dateHeader, statusHeader } = roleLabels(role);
    return [
      {
        header: '',
        key: 'hoh-indicator',
        render: ({ relationshipToHoH }) => (
          <HohIndicator relationshipToHoh={relationshipToHoH} />
        ),
      },
      {
        header: 'Name',
        key: 'name',
        linkTreatment: true,
        render: ({ clientName }) => (
          <Typography variant='body2'>{clientName}</Typography>
        ),
      },
      {
        header: statusHeader,
        key: 'status',
        render: (row) => {
          // Display info about 2 bad states:
          //  (1) the enrollment is non-WIP but for whatever reason there is no submitted intake assessment
          //  (2) the enrollment is exited but for whatever reason there is no submitted exit assessment
          if (
            [AssessmentRole.Intake, AssessmentRole.Exit].includes(role) &&
            row.entryOrExitCompleted &&
            (!row.assessmentId || row.assessmentInProgress)
          ) {
            const warningMessage =
              role === AssessmentRole.Intake
                ? 'Client is already entered. Please submit assessment.'
                : 'Client is already exited. Please submit assessment.';
            return (
              <Stack gap={1} sx={{ my: 1 }}>
                <AssessmentStatusIndicator status={row.status} />
                <Typography variant='body2' color='error'>
                  {warningMessage}
                </Typography>
              </Stack>
            );
          }

          return <AssessmentStatusIndicator status={row.status} />;
        },
      },
      {
        header: dateHeader,
        key: 'date',
        render: (row) => {
          let dateString = row.assessmentDate;
          if (!row.assessmentId) {
            // No assessment has been started yet
            if (role === AssessmentRole.Exit) dateString = row.exitDate;
            if (role === AssessmentRole.Intake) dateString = row.entryDate;
          } else if (row.assessmentSubmitted) {
            // Assessment has been submitted
            if (role === AssessmentRole.Exit) dateString = row.exitDate;
            if (role === AssessmentRole.Intake) dateString = row.entryDate;
          }

          if (!dateString) return null;

          return (
            <Typography variant='body2'>
              {parseAndFormatDate(dateString)}
            </Typography>
          );
        },
      },
    ];
  }, [role]);

  const handleSetSelected = useCallback(
    (rowIds: readonly string[]) => {
      const assessmentIds = tabs
        .filter((t) => rowIds.includes(t.id))
        .map((t) => t.assessmentId)
        .filter((id): id is string => !!id);
      setAssessmentsToSubmit(assessmentIds);
    },
    [setAssessmentsToSubmit, tabs]
  );
  return (
    <GenericTable<TabDefinition>
      rows={tabs}
      columns={columns}
      selectable='row'
      isRowSelectable={isSubmittable}
      rowSx={(row) => ({
        backgroundColor: isSubmittable(row)
          ? undefined
          : (theme) => theme.palette.grey[50],
      })}
      setSelectedRowIds={handleSetSelected}
    />
  );
};
export default HouseholdSummaryTable;
