/* eslint-disable @typescript-eslint/no-unused-vars */
import { Typography } from '@mui/material';
import { useOutletContext } from 'react-router-dom';

import { DashboardContext } from '@/components/pages/ClientDashboard';
import useSafeParams from '@/hooks/useSafeParams';
import { useAssessment } from '@/modules/assessments/components/useAssessment';
import { EnrollmentFieldsFragment } from '@/types/gqlTypes';

// PLACEHOLDER: implement read-only view of assessments
const ViewAssessmentPage = () => {
  const { client, enrollment } = useOutletContext<DashboardContext>();
  const { clientId, enrollmentId, assessmentId } = useSafeParams() as {
    clientId: string;
    enrollmentId: string;
    assessmentId: string;
  };

  const {
    definition,
    assessment,
    loading: dataLoading,
    assessmentTitle,
    formRole,
  } = useAssessment({
    enrollmentId,
    relationshipToHoH: (enrollment as EnrollmentFieldsFragment)
      .relationshipToHoH,
    client,
    assessmentId,
  });

  return <Typography>{assessmentTitle}</Typography>;
};

export default ViewAssessmentPage;
