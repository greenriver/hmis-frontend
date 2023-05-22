import { startCase } from 'lodash-es';
import { useCallback } from 'react';

import AssessmentStatus from '@/components/elements/AssessmentStatus';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  parseAndFormatDate,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import { ClientDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  AssessmentFieldsFragment,
  EnrollmentFieldsFragment,
  GetEnrollmentAssessmentsDocument,
  GetEnrollmentAssessmentsQuery,
  GetEnrollmentAssessmentsQueryVariables,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

// const ceColumns: ColumnDef<AssessmentFieldsFragment>[] = [
//   {
//     header: 'CE Type',
//     render: (a) => (
//       <HmisEnum value={a.assessmentType} enumMap={HmisEnums.AssessmentType} />
//     ),
//     linkTreatment: true,
//   },
//   {
//     header: 'Level',
//     render: (a) => (
//       <HmisEnum value={a.assessmentLevel} enumMap={HmisEnums.AssessmentLevel} />
//     ),
//   },
//   {
//     header: 'Location',
//     render: (e) => e.assessmentLocation,
//   },
// ];

const columns: ColumnDef<AssessmentFieldsFragment>[] = [
  {
    header: 'Date',
    width: '10%',
    linkTreatment: true,
    render: (e) => parseAndFormatDate(e.assessmentDate),
  },
  {
    header: 'Type',
    width: '10%',
    render: (assessment) =>
      startCase(assessment.customForm?.definition?.role?.toLowerCase()),
  },
  {
    header: 'Status',
    width: '10%',
    render: (assessment) => <AssessmentStatus assessment={assessment} />,
  },

  {
    header: 'Last Updated',
    width: '25%',
    render: (e) =>
      `${parseAndFormatDateTime(e.dateUpdated)} by ${
        e.user?.name || 'Unknown User'
      }`,
  },
];

const AssessmentsTable = ({
  clientId,
  enrollmentId,
}: {
  clientId: string;
  enrollmentId: string;
  enrollment: EnrollmentFieldsFragment;
}) => {
  const rowLinkTo = useCallback(
    (assessment: AssessmentFieldsFragment) =>
      generateSafePath(ClientDashboardRoutes.VIEW_ASSESSMENT, {
        clientId,
        enrollmentId,
        assessmentId: assessment.id,
      }),
    [clientId, enrollmentId]
  );

  return (
    <>
      <GenericTableWithData<
        GetEnrollmentAssessmentsQuery,
        GetEnrollmentAssessmentsQueryVariables,
        AssessmentFieldsFragment
      >
        queryVariables={{ id: enrollmentId }}
        queryDocument={GetEnrollmentAssessmentsDocument}
        rowLinkTo={rowLinkTo}
        columns={columns}
        pagePath='enrollment.assessments'
        noData='No assessments.'
        recordType='Assessment'
        filterInputType='AssessmentFilterOptions'
        sortOptions={HmisEnums.AssessmentSortOption}
        defaultSortOption='ASSESSMENT_DATE'
        headerCellSx={() => ({ color: 'text.secondary' })}
      />
    </>
  );
};

export default AssessmentsTable;
