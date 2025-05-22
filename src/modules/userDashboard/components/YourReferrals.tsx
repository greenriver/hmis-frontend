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

  // TODO(#7507) - using this "table" to display cards results in some dom validation issues that cause console warning.
  // When we refactor GenericTable to use hooks, we should consider supporting non-table layouts more gracefully.
  return (
    <>
      <Paper>
        <Stack gap={1} m={2}>
          <Typography component='h2' variant='h4'>
            Referrals
          </Typography>
          <Typography variant='caption'>
            Referral steps assigned to you
          </Typography>
        </Stack>
        <GenericTableWithData<
          GetUserCeAssignedStepsQuery,
          GetUserCeAssignedStepsQueryVariables,
          UserCeReferralStepFieldsFragment
        >
          queryVariables={{
            id: user.id,
          }}
          queryDocument={GetUserCeAssignedStepsDocument}
          columns={[]}
          pagePath='user.ceAssignedSteps'
          noData='No referral steps assigned to you'
          paginationItemName='step'
          defaultPageSize={10}
          recordType='CeReferralStep'
          renderRow={(step) => (
            <UserStepCard key={step.id} step={step} currentUserId={user.id} />
          )}
        />
      </Paper>
    </>
  );
};

export default YourReferrals;
