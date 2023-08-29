import { useMemo } from 'react';

import EsgFundingReportContent from './EsgFundingReportContent';

import useSafeParams from '@/hooks/useSafeParams';
import { useGetReferralPostingQuery } from '@/types/gqlTypes';

const ProjectEsgFundingReport: React.FC = () => {
  const { referralPostingId } = useSafeParams<{ referralPostingId: string }>();
  const { data, loading, error } = useGetReferralPostingQuery({
    variables: { id: referralPostingId as any as string },
  });

  const clientIds = useMemo(
    () => data?.referralPosting?.householdMembers?.map((hm) => hm.client.id),
    [data]
  );

  return (
    <EsgFundingReportContent
      clientIds={clientIds}
      loading={loading}
      error={error}
    />
  );
};
export default ProjectEsgFundingReport;
