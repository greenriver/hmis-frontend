import { Paper, Stack } from '@mui/material';
import Typography from '@mui/material/Typography';
import React from 'react';
import NotFound from '@/components/pages/NotFound';
import useAuth from '@/modules/auth/hooks/useAuth';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import UserStepCard from '@/modules/userDashboard/components/UserStepCard';
import {
  GetUserCeAssignedStepsDocument,
  GetUserCeAssignedStepsQuery,
  GetUserCeAssignedStepsQueryVariables,
  UserCeReferralStepFieldsFragment,
} from '@/types/gqlTypes';

const YourReferrals = () => {
  const { user } = useAuth();
  if (!user) return <NotFound />;

  return (
    <>
      <Paper>
        <Stack gap={1} m={2}>
          <Typography component='h2' variant='h4'>
            Referrals
          </Typography>
          <Typography variant='caption'>
            Referral tasks assigned to you
          </Typography>
        </Stack>
        <GenericTableWithData<
          GetUserCeAssignedStepsQuery,
          GetUserCeAssignedStepsQueryVariables,
          UserCeReferralStepFieldsFragment
        >
          queryVariables={{}}
          queryDocument={GetUserCeAssignedStepsDocument}
          columns={[]}
          pagePath='userDashboard.ceReferralSteps'
          noData='No referral tasks assigned to you'
          paginationItemName='task'
          defaultPageSize={10}
          recordType='CeReferralStep'
          renderRow={(step) => (
            <tr key={step.id}>
              <td>
                <UserStepCard step={step} currentUserId={user.id} />
              </td>
            </tr>
          )}
        />
      </Paper>
    </>
  );
};

export default YourReferrals;
