import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HistoryIcon from '@mui/icons-material/History';
import TimerIcon from '@mui/icons-material/Timer';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import { generatePath, useParams } from 'react-router-dom';

import ButtonLink from '@/components/elements/ButtonLink';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  EnrollmentFieldsFragment,
  GetClientEnrollmentsDocument,
  GetClientEnrollmentsQuery,
  GetClientEnrollmentsQueryVariables,
} from '@/types/gqlTypes';

const columns: ColumnDef<EnrollmentFieldsFragment>[] = [
  {
    header: 'Status',
    width: '10%',
    render: (e) => {
      let Icon = TimerIcon;
      let color: 'disabled' | 'error' | 'secondary' = 'disabled';
      let text = 'Closed';
      let textColor = 'gray';
      if (e.inProgress) {
        Icon = ErrorOutlineIcon;
        color = 'error';
        text = 'Incomplete';
        textColor = color;
      } else if (!e.exitDate) {
        Icon = HistoryIcon;
        color = 'secondary';
        text = 'Active';
        textColor = color;
      }
      return (
        <Stack direction='row' alignItems='center' gap={0.8}>
          <Icon color={color} fontSize='small' />
          <Typography
            variant='body2'
            color={textColor}
            sx={{ textDecoration: 'none' }}
          >
            {text}
          </Typography>
        </Stack>
      );
    },
  },
  {
    header: 'Project',
    render: (e) => e.project.projectName,
    linkTreatment: true,
  },
  {
    header: 'Start Date',
    render: (e) => (e.entryDate ? parseAndFormatDate(e.entryDate) : 'Unknown'),
  },
  {
    header: 'End Date',
    render: (e) => (e.exitDate ? parseAndFormatDate(e.exitDate) : 'Active'),
  },
];

const AllEnrollments = () => {
  const { clientId } = useParams() as { clientId: string };

  const rowLinkTo = useCallback(
    (enrollment: EnrollmentFieldsFragment) =>
      generatePath(DashboardRoutes.VIEW_ENROLLMENT, {
        clientId,
        enrollmentId: enrollment.id,
      }),
    [clientId]
  );

  return (
    <Grid container spacing={4}>
      <Grid item xs={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Enrollments
          </Typography>
          <GenericTableWithData<
            GetClientEnrollmentsQuery,
            GetClientEnrollmentsQueryVariables,
            EnrollmentFieldsFragment
          >
            queryVariables={{ id: clientId }}
            queryDocument={GetClientEnrollmentsDocument}
            rowLinkTo={rowLinkTo}
            columns={columns}
            pagePath='client.enrollments'
            // FIXME we shouldn't need this, but the cache for GetClientEnrollments
            // isn't updated after a new enrollment is created. Figure out how to
            // fix that with cache policies and remove this.
            fetchPolicy='cache-and-network'
          />
        </Paper>
      </Grid>
      <Grid item xs>
        <Paper sx={{ p: 2 }}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Actions
          </Typography>
          <ButtonLink
            variant='outlined'
            color='secondary'
            to={generatePath(DashboardRoutes.NEW_ENROLLMENT, {
              clientId,
            })}
          >
            + Add Enrollment
          </ButtonLink>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default AllEnrollments;
