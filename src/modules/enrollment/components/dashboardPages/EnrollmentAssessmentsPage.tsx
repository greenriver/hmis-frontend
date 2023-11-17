import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import { Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useCallback, useState } from 'react';
import EnrollmentAssessmentActionButtons from '../EnrollmentAssessmentActionButtons';
import EnrollmentAssessmentsTable from '../EnrollmentAssessmentsTable';
import HouseholdAssessmentsTable from '../HouseholdAssessmentsTable';
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
  const onChangeMode = useCallback(
    (event: React.MouseEvent<HTMLElement>, value: Mode) =>
      value && setMode(value),
    []
  );

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
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={onChangeMode}
              aria-label='view assessments by'
            >
              <ToggleButton
                value='current_client'
                aria-label='Assessments for Client'
                size='small'
                sx={{ px: 2 }}
              >
                <PersonIcon fontSize='small' sx={{ mr: 0.5 }} />
                Client
              </ToggleButton>
              <ToggleButton
                value='household'
                aria-label='Assessments for Household'
                size='small'
                sx={{ px: 2 }}
              >
                <PeopleIcon fontSize='small' sx={{ mr: 0.5 }} />
                Household
              </ToggleButton>
            </ToggleButtonGroup>
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
