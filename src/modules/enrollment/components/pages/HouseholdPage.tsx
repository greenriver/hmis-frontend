import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useEnrollmentDashboardContext from '@/modules/enrollment/hooks/useEnrollmentDashboardContext';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import ManageHousehold from '@/modules/household/components/ManageHousehold';

const HouseholdPage = () => {
  const { enrollment, client } = useEnrollmentDashboardContext();
  if (!enrollment) return <NotFound />;

  return (
    <>
      <PageTitle
        title={`Household for ${clientBriefName(client)} at ${enrollment.project.projectName}`}
      />
      <ManageHousehold
        project={enrollment.project}
        householdId={enrollment.householdId}
        canEdit={enrollment.access.canEditEnrollments}
        // canEdit={false}
      />
      {/* <TitleCard
        title='Household'
        headerVariant='border'
        headerComponent='h1'
        actions={
          <CommonLabeledTextBlock title='Household ID' horizontal>
            <ClickToCopyId value={enrollment.householdId} />
          </CommonLabeledTextBlock>
        }
      >
        <HouseholdMemberTable clientId={clientId} enrollmentId={enrollmentId} />
      </TitleCard> */}
    </>
  );
};

export default HouseholdPage;
