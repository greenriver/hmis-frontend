import React from 'react';
import CommonTabs from '@/components/elements/CommonTabs';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import CreateOpportunityButton from '@/modules/ce/components/CreateOpportunityButton';
import ProjectOpportunitiesTable from '@/modules/ce/components/ProjectOpportunitiesTable';
import ProjectReferralsTable from '@/modules/ce/components/ProjectReferralsTable';

interface Props {}
const ProjectCePage: React.FC = () => {
  const { projectId } = useSafeParams() as {
    projectId: string;
  };

  return (
    <>
      <PageTitle
        title={'Coordinated Entry'}
        actions={<CreateOpportunityButton projectId={projectId} />}
      />

      <CommonTabs
        ariaLabel={'Project CE Tabs'}
        tabDefinitions={[
          {
            title: 'Available Units',
            key: 'opportunities',
            contents: <ProjectOpportunitiesTable />,
          },
          {
            title: 'Ongoing Referrals',
            key: 'referrals',
            contents: <ProjectReferralsTable />,
          },
        ]}
      />
    </>
  );
};

export default ProjectCePage;
