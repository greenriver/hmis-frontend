import { Box, Card, Skeleton, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useMemo } from 'react';

import GenericTable from './GenericTable';

import { isRecentEnrollment } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  useGetClientEnrollmentsQuery,
  EnrollmentFieldsFragment,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const RecentEnrollments = ({
  clientId,
}: {
  clientId: string;
  linkTargetBlank?: boolean;
}) => {
  // Fetch recent enrollments
  const {
    data: { client } = {},
    loading,
    error,
  } = useGetClientEnrollmentsQuery({
    variables: { id: clientId },
    // Don't let this list get stale because we use it on the client profile.
    // We can remove this once we replace the client profile, and are only using the
    // ClientCard for search results.
    fetchPolicy: 'cache-and-network',
  });

  const recentEnrollments = useMemo(
    () =>
      client?.enrollments?.nodes
        ? client.enrollments.nodes.filter((enrollment) =>
            isRecentEnrollment(enrollment)
          )
        : [],
    [client]
  );

  if (error) throw error;
  if (loading || !client)
    return <Skeleton variant='rectangular' width='100%' height={50} />;

  if (recentEnrollments && recentEnrollments.length === 0)
    return (
      <Typography sx={{ p: 2 }} color='GrayText'>
        No Recent Enrollments
      </Typography>
    );

  return (
    <GenericTable<EnrollmentFieldsFragment>
      noHead
      rows={recentEnrollments}
      columns={[
        {
          key: 'name',
          header: 'Name',
          linkTreatment: true,
          render: (e) => e.project.projectName,
        },
        {
          key: 'status',
          header: 'Status',
          render: (e) => (
            <Typography color='GrayText' variant='inherit'>
              {e.exitDate ? 'Complete' : 'Incomplete'}
            </Typography>
          ),
        },
        {
          key: 'members',
          header: 'Members',
          render: (e) => (
            <Typography color='GrayText' variant='inherit' noWrap>
              {e.householdSize || '?'} Members
            </Typography>
          ),
        },
        {
          key: 'dates',
          header: 'Dates',
          render: (e) => (
            <Typography color='GrayText' variant='inherit'>
              {format(new Date(e.entryDate), 'M/d/yyyy')} -{' '}
              {e.exitDate ? format(new Date(e.exitDate), 'M/d/yyyy') : 'Active'}
            </Typography>
          ),
        },
      ]}
      rowLinkTo={(row) =>
        generateSafePath(DashboardRoutes.VIEW_ENROLLMENT, {
          clientId: client.id,
          enrollmentId: row.id,
        })
      }
    />
  );
};

interface Props {
  client: ClientFieldsFragment;
}

const ClientEnrollmentCard: React.FC<Props> = ({ client }) => {
  return (
    <Card>
      <Box
        sx={(theme) => ({
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Typography>Recent Enrollments</Typography>
      </Box>
      <RecentEnrollments clientId={client.id} />
    </Card>
  );
};

export default ClientEnrollmentCard;
