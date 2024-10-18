import { useMemo } from 'react';

import useSafeParams from '@/hooks/useSafeParams';
import { useHouseholdMembers } from '@/modules/household/hooks/useHouseholdMembers';
import EsgFundingReportContent from '@/modules/projects/components/EsgFundingReportContent';

const EnrollmentEsgFundingReport: React.FC = () => {
  const { enrollmentId } = useSafeParams<{ enrollmentId: string }>();
  const [householdMembers, { loading, error }] = useHouseholdMembers(
    enrollmentId || ''
  );

  const clientIds = useMemo(
    () => householdMembers?.map((hm) => hm.client.id),
    [householdMembers]
  );

  return (
    <EsgFundingReportContent
      clientIds={clientIds}
      loading={loading}
      error={error}
    />
  );
};
export default EnrollmentEsgFundingReport;
