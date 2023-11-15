import { useCallback } from 'react';

import EnrollmentAssessmentActionButtons from '../EnrollmentAssessmentActionButtons';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import AssessmentDateWithStatusIndicator from '@/modules/hmis/components/AssessmentDateWithStatusIndicator';
import {
  clientBriefName,
  formRoleDisplay,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  AssessmentFieldsFragment,
  GetEnrollmentAssessmentsDocument,
  GetEnrollmentAssessmentsQuery,
  GetEnrollmentAssessmentsQueryVariables,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

// FIXME: share configuration with AllAssesments component
const columns: ColumnDef<AssessmentFieldsFragment>[] = [
  {
    header: 'Assessment Date',
    render: (a) => <AssessmentDateWithStatusIndicator assessment={a} />,
  },
  {
    header: 'Assessment Type',
    render: (assessment) => formRoleDisplay(assessment),
    linkTreatment: true,
  },
  {
    header: 'Last Updated',
    render: (e) =>
      `${
        e.dateUpdated ? parseAndFormatDateTime(e.dateUpdated) : 'Unknown Date'
      } by ${e.user?.name || 'Unknown User'}`,
  },
];

const AssessmentsTable = () => {
  const { enrollment } = useEnrollmentDashboardContext();
  const enrollmentId = enrollment?.id;
  const clientId = enrollment?.client.id;
  const rowLinkTo = useCallback(
    (assessment: AssessmentFieldsFragment) =>
      generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
        clientId,
        enrollmentId,
        assessmentId: assessment.id,
        formRole: assessment.role,
      }),
    [clientId, enrollmentId]
  );

  if (!enrollment || !enrollmentId || !clientId) return <NotFound />;

  return (
    <TitleCard
      title={`${
        enrollment.householdSize > 1 ? clientBriefName(enrollment.client) : ''
      } Assessments`}
      actions={
        enrollment.access.canEditEnrollments && (
          <EnrollmentAssessmentActionButtons enrollment={enrollment} />
        )
      }
      headerVariant='border'
      data-testid='enrollmentAssessmentsCard'
    >
      <GenericTableWithData<
        GetEnrollmentAssessmentsQuery,
        GetEnrollmentAssessmentsQueryVariables,
        AssessmentFieldsFragment
      >
        showFilters
        queryVariables={{ id: enrollmentId }}
        queryDocument={GetEnrollmentAssessmentsDocument}
        rowLinkTo={rowLinkTo}
        columns={columns}
        pagePath='enrollment.assessments'
        noData='No assessments'
        recordType='Assessment'
        headerCellSx={() => ({ color: 'text.secondary' })}
      />
    </TitleCard>
  );
};

export default AssessmentsTable;
