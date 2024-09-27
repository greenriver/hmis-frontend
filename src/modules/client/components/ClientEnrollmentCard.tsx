import { Box, CircularProgress, Typography } from '@mui/material';
import { useMemo } from 'react';

import { EnrollmentDashboardRoutes } from '@/app/routes';
import GenericTable from '@/components/elements/table/GenericTable';
import TitleCard from '@/components/elements/TitleCard';
import { isRecentEnrollment } from '@/modules/hmis/hmisUtil';
import {
  ENROLLMENT_PERIOD_COL,
  ENROLLMENT_STATUS_COL,
} from '@/modules/projects/components/tables/ProjectClientEnrollmentsTable';
import {
  ClientEnrollmentFieldsFragment,
  ClientFieldsFragment,
  useGetClientEnrollmentsQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

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
    <GenericTable<ClientEnrollmentFieldsFragment>
      noHead
      rows={recentEnrollments}
      columns={[
        ENROLLMENT_STATUS_COL,
        {
          key: 'name',
          header: 'Name',
          linkTreatment: true,
          render: 'projectName',
        },
        ENROLLMENT_PERIOD_COL,
      ]}
      rowLinkTo={(row) =>
        row.access.canViewEnrollmentDetails
          ? generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
              clientId: client.id,
              enrollmentId: row.id,
            })
          : null
      }
    />
  );
};

interface Props {
  client: ClientFieldsFragment;
}

const ClientEnrollmentCard: React.FC<Props> = ({ client }) => {
  return (
    <TitleCard title='Recent Enrollments' headerVariant='border'>
      <RecentEnrollments clientId={client.id} />
    </TitleCard>
  );
};

export default ClientEnrollmentCard;
