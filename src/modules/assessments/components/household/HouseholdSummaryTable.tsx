import { Box, Checkbox, CheckboxProps, Link, Typography } from '@mui/material';
import { Dispatch, SetStateAction, useMemo } from 'react';

import { AssessmentStatus, TabDefinition } from './util';

import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import HohIndicator from '@/modules/hmis/components/HohIndicator';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { FormRole } from '@/types/gqlTypes';

const NOT_STARTED = 'Assessment not started';

interface Props {
  tabs: TabDefinition[];
  role: FormRole.Intake | FormRole.Exit;
  checked: Record<string, boolean>;
  onClickCheckbox: (...assessmentIds: string[]) => CheckboxProps['onChange'];
  setCurrentTab: Dispatch<SetStateAction<string | undefined>>;
}

const HouseholdSummaryTable = ({
  tabs,
  role,
  checked,
  onClickCheckbox,
  setCurrentTab,
}: Props) => {
  const columns: ColumnDef<TabDefinition>[] = useMemo(() => {
    const submittable = tabs
      .filter((tab) => tab.assessmentId && tab.assessmentInProgress)
      .map(({ assessmentId }) => assessmentId) as string[];

    return [
      {
        key: 'checkbox',
        textAlign: 'center',
        header: (
          <>
            <Checkbox
              // checked={!!(row.assessmentId && checked[row.assessmentId])}
              disabled={submittable.length === 0}
              onChange={(...args) => {
                const func = onClickCheckbox(...submittable);
                if (func) func(...args);
              }}
              aria-label={`Select All`}
            />
          </>
        ),
        width: '10%',
        render: (row) => {
          const disabledReason = !row.assessmentId
            ? 'Not started'
            : row.status === AssessmentStatus.Submitted
            ? 'Submitted'
            : undefined;
          if (disabledReason) {
            return (
              <Box sx={{ py: 1 }}>
                <Typography
                  variant='caption'
                  color={'text.secondary'}
                  fontStyle='italic'
                  sx={{ pl: 2, whiteSpace: 'no-wrap' }}
                >
                  {disabledReason}
                </Typography>
              </Box>
            );
          }

          return (
            // <ButtonTooltipContainer title={disabledReason}>
            <Checkbox
              checked={!!(row.assessmentId && checked[row.assessmentId])}
              indeterminate={row.status === AssessmentStatus.Submitted}
              disabled={!!disabledReason}
              onChange={
                row.assessmentId ? onClickCheckbox(row.assessmentId) : undefined
              }
              aria-label={`Submit assessment for ${row.clientName} `}
            />
            // </ButtonTooltipContainer>
          );
        },
      },
      {
        header: '',
        key: 'hoh-indicator',
        width: '5%',
        render: ({ relationshipToHoH }) => (
          <HohIndicator relationshipToHoh={relationshipToHoH} />
        ),
      },
      {
        header: 'Name',
        key: 'name',
        width: '20%',
        render: ({ clientName }) => <Typography>{clientName}</Typography>,
      },
      {
        header: `${role === FormRole.Exit ? 'Exit' : 'Entry'} Status`,
        key: 'status',
        width: '20%',
        render: (row) => {
          if (row.entryOrExitCompleted) {
            // Enrollment is fully Entered/Exited, but the assessment itself is missing.
            const assessmentMissing = !row.assessmentId;
            // Enrollment is fully Entered/Exited, but the assessment is still in WIP status.
            const assessmentWip = row.assessmentId && row.assessmentInProgress;
            return (
              <>
                <Typography>
                  {role === FormRole.Exit ? 'Exited' : 'Entered'}
                </Typography>
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
            assessmentStatus = 'Assessment saved';
          }
          return <Typography>{assessmentStatus}</Typography>;
        },
      },
      {
        header: `${role === FormRole.Exit ? 'Exit' : 'Entry'} Date`,
        key: 'date',
        width: '10%',
        render: (row) => {
          let dateString;
          if (!row.assessmentId) {
            // No assessment has been started yet
            dateString = role === FormRole.Exit ? row.exitDate : row.entryDate;
          } else if (row.assessmentSubmitted) {
            // Assessment has been submitted
            dateString = role === FormRole.Exit ? row.exitDate : row.entryDate;
          } else {
            // Assessment is in-progress
            dateString = row.assessmentDate;
          }

          if (!dateString) return null;

          return <Typography>{parseAndFormatDate(dateString)}</Typography>;
        },
      },
      // TODO pull out Destination from WIP assmt
      // ...(role === FormRole.Exit
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
  }, [checked, onClickCheckbox, role, tabs, setCurrentTab]);

  return (
    <GenericTable<TabDefinition>
      rows={tabs}
      columns={columns}
      rowSx={(row) => ({
        // HoH indicator column
        'td:nth-of-type(1)': { px: 0 },
        backgroundColor: row.assessmentSubmitted
          ? (theme) => theme.palette.grey[50]
          : undefined,
        '.MuiTypography-root': {
          color: row.assessmentSubmitted ? 'text.secondary' : undefined,
        },
      })}
    />
  );
};
export default HouseholdSummaryTable;
