import { Paper } from '@mui/material';
import React from 'react';
import {
  CommonDetailGridContainer,
  CommonDetailGridItem,
} from '@/components/elements/CommonDetailGrid';
import Loading from '@/components/elements/Loading';
import RouterLink from '@/components/elements/RouterLink';
import BasicBreadcrumbPageLayout from '@/components/layout/BasicBreadcrumbPageLayout';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { useGetCeReferralQuery } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {}
const Referral: React.FC<Props> = ({}) => {
  const { referralId } = useSafeParams() as {
    referralId: string;
  };

  const {
    data: { ceReferral: referral } = {},
    loading,
    error,
  } = useGetCeReferralQuery({
    variables: {
      id: referralId,
    },
  });

  if (loading) return <Loading />;
  if (!referral) return <NotFound />;
  if (error) throw error;

  return (
    <BasicBreadcrumbPageLayout
      crumbs={[
        { label: 'To Do', to: '' },
        { label: 'This Referral', to: '' },
      ]}
    >
      <PageTitle title={'Referral'} />
      <Paper>
        <CommonDetailGridContainer>
          <CommonDetailGridItem label={'Opportunity'}>
            <RouterLink
              to={generateSafePath(ProjectDashboardRoutes.OPPORTUNITY, {
                projectId: referral.opportunity.projectId,
                opportunityId: referral.opportunity.id,
              })}
            >
              Opportunity {referral.opportunity.name}
            </RouterLink>
          </CommonDetailGridItem>
          <CommonDetailGridItem label={'Status'}>
            {referral.status}
          </CommonDetailGridItem>
          <CommonDetailGridItem label={'Steps'}>
            {referral.steps.length}
          </CommonDetailGridItem>
        </CommonDetailGridContainer>
      </Paper>
    </BasicBreadcrumbPageLayout>
  );
};

export default Referral;
