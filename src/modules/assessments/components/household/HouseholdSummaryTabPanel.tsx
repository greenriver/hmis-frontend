import { Grid, Paper, Typography } from '@mui/material';
import { memo } from 'react';

import { assessmentPrefix } from '../../util';

import AlwaysMountedTabPanel from './AlwaysMountedTabPanel';
import {
  AssessmentStatus,
  labelForStatus,
  TabDefinition,
  tabPanelA11yProps,
} from './util';

import SimpleTable from '@/components/elements/SimpleTable';
import { AssessmentRole } from '@/types/gqlTypes';

const SummaryTable = ({
  tabs,
  role,
}: {
  tabs: TabDefinition[];
  role: AssessmentRole.Intake | AssessmentRole.Exit;
}) => {
  return (
    <SimpleTable
      headers
      TableCellProps={{
        sx: {
          borderBottom: 0,
          py: 0.5,
          px: 1,
          '&:first-of-type': {
            pl: 0,
            // maxWidth: '100px',
            // whiteSpace: 'nowrap',
            verticalAlign: 'baseline',
          },
        },
      }}
      columns={[
        {
          name: 'Client',
          label: <Typography fontWeight={600}>Client</Typography>,
          render: (row) => <Typography>{row.clientName}</Typography>,
        },
        {
          name: 'Assessment Status',
          label: (
            <Typography fontWeight={600}>
              {role === AssessmentRole.Exit ? 'Exit' : 'Intake'} Assessment
              Status
            </Typography>
          ),
          render: (row) => (
            <Typography
              color={
                row.status === AssessmentStatus.ReadyToSubmit
                  ? (theme) => theme.palette.success.main
                  : 'text.secondary'
              }
            >
              {labelForStatus(row.status)}
            </Typography>
          ),
        },
        {
          name: 'date',
          label: (
            <Typography fontWeight={600}>
              {role === AssessmentRole.Exit ? 'Exit' : 'Entry'} Date
            </Typography>
          ),
          render: (row) => (
            <Typography
              color={
                row.status === AssessmentStatus.ReadyToSubmit
                  ? (theme) => theme.palette.success.main
                  : 'text.secondary'
              }
            >
              To do
            </Typography>
          ),
        },
      ]}
      rows={tabs}
    />
  );
};

interface HouseholdSummaryTabPanelProps {
  active: boolean;
  assessmentRole: AssessmentRole.Intake | AssessmentRole.Exit;
  tabs: TabDefinition[];
  id: string;
  projectName: string;
  // refetch: () => Promise<any>;
  // nextTab?: string;
  // previousTab?: string;
  // navigateToTab: (t: string) => void;
  // updateTabStatus: (status: AssessmentStatus, tabId: string) => void;
}

// Memoized to only re-render when props change (shallow compare)
const HouseholdSummaryTabPanel = memo(
  ({
    assessmentRole,
    active,
    id,
    tabs,
    projectName,
  }: HouseholdSummaryTabPanelProps) => {
    console.debug('Rendering summary panel');

    return (
      <AlwaysMountedTabPanel
        active={active}
        key='summary'
        {...tabPanelA11yProps(id)}
      >
        <Grid
          container
          justifyContent='center'
          alignItems='center'
          sx={{ py: 2 }}
        >
          <Grid item xs={12} md={10} lg={10}>
            <Typography variant='h4' sx={{ mb: 3 }}>
              Complete {assessmentPrefix(assessmentRole)} {projectName}
            </Typography>

            <Paper sx={{ p: 2 }}>
              <SummaryTable tabs={tabs} role={assessmentRole} />
            </Paper>
          </Grid>
        </Grid>
      </AlwaysMountedTabPanel>
    );
  }
);

export default HouseholdSummaryTabPanel;
