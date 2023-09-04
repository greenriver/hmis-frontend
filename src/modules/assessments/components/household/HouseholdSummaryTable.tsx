import { Link, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useMemo } from 'react';

import { HouseholdAssesmentRole, TabDefinition } from './util';

import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { AssessmentRole } from '@/types/gqlTypes';

const NOT_STARTED = 'Not started';

interface Props {
  tabs: TabDefinition[];
  role: HouseholdAssesmentRole;
  setAssessmentsToSubmit: (assessmentIds: readonly string[]) => void;
  setCurrentTab: Dispatch<SetStateAction<string | undefined>>;
}

const roleLabels = (role: HouseholdAssesmentRole) => {
  switch (role) {
    case AssessmentRole.Intake:
      return {
        dateHeader: 'Entry Date',
        completedText: 'Submitted',
        statusHeader: 'Intake Assessment Status',
      };
    case AssessmentRole.Exit:
      return {
        dateHeader: 'Exit Date',
        completedText: 'Exited',
        statusHeader: 'Exit Assessment Status',
      };
    default:
      return {
        dateHeader: 'Assessment Date',
        completedText: 'Submitted',
        statusHeader: 'Assessment Status',
      };
  }
};

const isSubmittable = (row: TabDefinition) =>
  !!(row.assessmentId && row.assessmentInProgress);

const HouseholdSummaryTable = ({
  tabs,
  role,
  setCurrentTab,
  setAssessmentsToSubmit,
}: Props) => {
  const submittable = tabs
    .filter((tab) => tab.assessmentId && tab.assessmentInProgress)
    .map(({ assessmentId }) => assessmentId) as string[];

  const columns: ColumnDef<TabDefinition>[] = useMemo(() => {
    const { dateHeader, statusHeader, completedText } = roleLabels(role);
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
        render: ({ clientName }) => <Typography>{clientName}</Typography>,
      },
      {
        header: statusHeader,
        key: 'status',
        render: (row) => {
          if (row.entryOrExitCompleted) {
            // Enrollment is fully Entered/Exited, but the assessment itself is missing.
            const assessmentMissing = !row.assessmentId;
            // Enrollment is fully Entered/Exited, but the assessment is still in WIP status.
            const assessmentWip = row.assessmentId && row.assessmentInProgress;
            return (
              <>
                <Typography>{completedText}</Typography>
                {assessmentWip && (
                  <Typography color='error' fontStyle='italic'>
                    {assessmentWip && 'Assessment Not Submitted'}
                  </Typography>
                )}
                {assessmentMissing && (
                  <Link onClick={() => setCurrentTab(row.id)}>
                    <Typography>{NOT_STARTED}</Typography>
                  </Link>
                )}
              </>
            );
          }

          // No assessment has been started yet
          if (!row.assessmentId) {
            return (
              <Link onClick={() => setCurrentTab(row.id)}>
                <Typography>{NOT_STARTED}</Typography>
              </Link>
            );
          }

          let assessmentStatus;
          if (row.assessmentSubmitted) {
            // Assessment has been submitted (bad state, entry/exit should be completed if this is the case)
            assessmentStatus = 'Assessment submitted';
          } else {
            // Assessment is in-progress
            assessmentStatus = 'In Progress';
          }
          return <Typography>{assessmentStatus}</Typography>;
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

          return <Typography>{parseAndFormatDate(dateString)}</Typography>;
        },
      },
      // TODO pull out Destination from WIP assmt
      // ...(role === AssessmentRole.Exit
      //   ? [
      //       {
      //         header: `Destination`,
      //         key: 'destination',
      //         width: '10%',
      //         render: (row) => {
      //           return 'destination';
      //         },
      //       },
      //     ]
      //   : []),
    ];
  }, [role, setCurrentTab]);

  return (
    <GenericTable<TabDefinition>
      rows={tabs}
      columns={columns}
      selectable={submittable.length > 0}
      isRowSelectable={isSubmittable}
      rowSx={(row) => ({
        backgroundColor: isSubmittable(row)
          ? undefined
          : (theme) => theme.palette.grey[50],
        '.MuiTypography-root': {
          color: row.assessmentSubmitted ? 'text.secondary' : undefined,
        },
      })}
      setSelectedRowIds={setAssessmentsToSubmit}
    />
  );
};
export default HouseholdSummaryTable;
