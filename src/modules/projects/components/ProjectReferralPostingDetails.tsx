import { Paper } from '@mui/material';
import { useParams } from 'react-router-dom';

import { useProjectDashboardContext } from './ProjectDashboard';

import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import { useGetReferralPostingQuery } from '@/types/gqlTypes';

const ProjectReferralPostingDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { project } = useProjectDashboardContext();
  const { data, loading } = useGetReferralPostingQuery({
    variables: { id: projectId as any as string },
  });
  const referralPosting = data?.referralPosting;

  if (loading) {
    return <Loading />;
  }
  if (!referralPosting) {
    return <NotFound />;
  }

  return (
    <>
      <div></div>
      <PageTitle
        title={`Incoming Referral from ${referralPosting.referredBy}`}
      />
      <Paper>
        referral posting details here
        {referralPosting.id}
        <br />
        {project.id}
      </Paper>
      <Paper>
        <h1>Provider Notes</h1>
        {referralPosting.referralNotes}
        <h1>Resource Coordinator Notes</h1>
        {referralPosting.resourceCoordinatorNotes}
      </Paper>
    </>
  );
};
export default ProjectReferralPostingDetails;
