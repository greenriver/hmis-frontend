import { Box, Card, CircularProgress, Typography } from '@mui/material';
import { format } from 'date-fns';
import { useMemo } from 'react';

import EnrollmentStatus from '@/components/elements/EnrollmentStatus';
import GenericTable from '@/components/elements/GenericTable';
import { enrollmentName, isRecentEnrollment } from '@/modules/hmis/hmisUtil';
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
  if (loading || !client) {
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
        {
          key: 'status',
          header: 'Status',
          render: (e) => <EnrollmentStatus enrollment={e} />,
        },
        {
          key: 'members',
          header: 'Members',
          render: (e) => (
            <Typography color='GrayText' variant='inherit' noWrap>
              {e.householdSize} Member{e.householdSize === 1 ? '' : 's'}
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
