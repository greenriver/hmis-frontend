import PersonIcon from '@mui/icons-material/Person';
import { useMemo, useState } from 'react';
import EnrollmentAssessmentActionButtons from '../EnrollmentAssessmentActionButtons';
import EnrollmentAssessmentsTable from '../EnrollmentAssessmentsTable';
import HouseholdAssessmentsTable from '../HouseholdAssessmentsTable';
import CommonToggle from '@/components/elements/CommonToggle';
import { HouseholdIcon } from '@/components/elements/SemanticIcons';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import { clientBriefName } from '@/modules/hmis/hmisUtil';

type Mode = 'current_client' | 'household';

const AssessmentsTable = () => {
  const { enrollment } = useEnrollmentDashboardContext();
  const [mode, setMode] = useState<Mode>('current_client');
  const enrollmentId = enrollment?.id;
  const clientId = enrollment?.client.id;

  const actions = useMemo(() => {
    if (!enrollment) return [];

    const actions = [];
    if (enrollment.householdSize > 1) {
      actions.push(
        <CommonToggle
          value={mode}
          onChange={setMode}
          variant='gray'
          size='small'
          aria-label='view assessments for'
          items={[
            {
              value: 'current_client',
              label: 'Client',
              Icon: PersonIcon,
            },
            {
              value: 'household',
              label: 'Household',
              Icon: HouseholdIcon,
            },
          ]}
          key='household-client-toggle'
        />
      );
    }
    if (enrollment.access.canEditEnrollments) {
      actions.push(
        <EnrollmentAssessmentActionButtons
          enrollment={enrollment}
          key='enrollment-assessment-action'
        />
      );
    }
    return actions;
  }, [enrollment, mode]);

  if (!enrollment || !enrollmentId || !clientId) return <NotFound />;

  return (
    <TitleCard
      title={
        mode === 'current_client'
          ? `${clientBriefName(enrollment.client)} Assessments`
          : 'Household Assessments'
      }
      actions={actions}
      headerVariant='border'
      data-testid='enrollmentAssessmentsCard'
      mobileBreakpoint='md'
    >
      {mode === 'current_client' && (
        <EnrollmentAssessmentsTable
          enrollmentId={enrollmentId}
          clientId={clientId}
        />
      )}
      {mode === 'household' && (
        <HouseholdAssessmentsTable householdId={enrollment.householdId} />
      )}
    </TitleCard>
  );
};

export default AssessmentsTable;
