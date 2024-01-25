import { ClickToCopyId } from '@/components/elements/ClickToCopy';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import HouseholdMemberTable from '@/modules/household/components/HouseholdMemberTable';

const HouseholdPage = () => {
  const { enrollment } = useEnrollmentDashboardContext();
  const { clientId, enrollmentId } = useSafeParams() as {
    enrollmentId: string;
    clientId: string;
  };

  if (!enrollment) return <NotFound />;

  return (
    <TitleCard
      title='Household'
      headerVariant='border'
      actions={
        <CommonLabeledTextBlock title='Household ID' horizontal>
          <ClickToCopyId value={enrollment.householdId} />
        </CommonLabeledTextBlock>
      }
    >
      <HouseholdMemberTable clientId={clientId} enrollmentId={enrollmentId} />
    </TitleCard>
  );
};

export default HouseholdPage;
