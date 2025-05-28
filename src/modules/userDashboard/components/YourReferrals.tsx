import React from 'react';
import CommonCard from '@/components/elements/CommonCard';
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
      <CommonCard title='Referrals' TitleComponent='h2' sx={{ pb: 1 }}>
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
          tableProps={{ sx: { 'tbody > :not(:last-child) td': { pb: 1 } } }}
          renderRow={(step) => (
            <tr key={step.id}>
              <td>
                <UserStepCard step={step} currentUserId={user.id} />
              </td>
            </tr>
          )}
        />
      </CommonCard>
    </>
  );
};

export default YourReferrals;
