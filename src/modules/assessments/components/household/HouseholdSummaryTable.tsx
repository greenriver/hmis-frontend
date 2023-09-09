import { Link, Typography } from '@mui/material';
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
  setCurrentTab,
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
        render: ({ clientName, id }) => (
          <Link onClick={() => setCurrentTab(id)}>
            <Typography>{clientName}</Typography>
          </Link>
        ),
      },
      {
        header: statusHeader,
        key: 'status',
        render: (row) => {
          // Unclear if additional info about if the enrollment status is needed here
          //if (row.entryOrExitCompleted) {
          //  // Enrollment is fully Entered/Exited, but the assessment itself is missing.
          //  const assessmentMissing = !row.assessmentId;
          //  // Enrollment is fully Entered/Exited, but the assessment is still in WIP status.
          //  const assessmentWip = row.assessmentId && row.assessmentInProgress;
          //  return (
          //    <>
          //      <Typography>{completedText}</Typography>
          //      {assessmentWip && (
          //        <Typography color='error' fontStyle='italic'>
          //          {assessmentWip && 'Assessment Not Submitted'}
          //        </Typography>
          //      )}
          //      {assessmentMissing && (
          //        <Link onClick={() => setCurrentTab(row.id)}>
          //          <Typography>{NOT_STARTED}</Typography>
          //        </Link>
          //      )}
          //    </>
          //  );
          //}

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
      selectable
      isRowSelectable={isSubmittable}
      rowSx={(row) => ({
        backgroundColor: isSubmittable(row)
          ? undefined
          : (theme) => theme.palette.grey[50],
        '.MuiTypography-root': {
          color: row.assessmentSubmitted ? 'text.secondary' : undefined,
        },
      })}
      setSelectedRowIds={handleSetSelected}
    />
  );
};
export default HouseholdSummaryTable;
