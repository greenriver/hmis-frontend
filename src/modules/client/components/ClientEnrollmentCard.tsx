import { Box, Card, CircularProgress, Typography } from '@mui/material';
import { useMemo } from 'react';

import GenericTable from '@/components/elements/table/GenericTable';
import { enrollmentName, isRecentEnrollment } from '@/modules/hmis/hmisUtil';
import { ENROLLMENT_COLUMNS } from '@/modules/projects/components/tables/ProjectClientEnrollmentsTable';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  EnrollmentFieldsFragment,
  useGetClientEnrollmentsQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const RecentEnrollments = ({
  clientId,
}: {
  clientId: string;
  linkTargetBlank?: boolean;
}) => {
  const {
    data: { client } = {},
    loading,
    error,
  } = useGetClientEnrollmentsQuery({
    variables: { id: clientId },
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
  if (loading && !client) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: (theme) => theme.palette.text.disabled,
          p: 2,
        }}
      >
        <CircularProgress color='inherit' />
      </Box>
    );
  }
  if (!client) throw new Error('client not found');

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
          render: (e) => enrollmentName(e),
        },
        ENROLLMENT_COLUMNS.enrollmentStatus,
        {
          key: 'members',
          header: 'Members',
          render: (e) => (
            <Typography color='text.secondary' variant='inherit' noWrap>
              {e.householdSize} Member{e.householdSize === 1 ? '' : 's'}
            </Typography>
          ),
        },
        ENROLLMENT_COLUMNS.enrollmentPeriod,
      ]}
      rowLinkTo={(row) =>
        generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
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
