import PersonIcon from '@mui/icons-material/Person';
import { Stack } from '@mui/material';
import { useState } from 'react';
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

  if (!enrollment || !enrollmentId || !clientId) return <NotFound />;

  return (
    <TitleCard
      title={
        mode === 'current_client'
          ? `${clientBriefName(enrollment.client)} Assessments`
          : 'Household Assessments'
      }
      actions={
        <Stack direction='row' gap={4}>
          {enrollment.householdSize > 1 && (
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
            />
          )}
          {enrollment.access.canEditEnrollments && (
            <EnrollmentAssessmentActionButtons enrollment={enrollment} />
          )}
        </Stack>
      }
      headerVariant='border'
      data-testid='enrollmentAssessmentsCard'
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
