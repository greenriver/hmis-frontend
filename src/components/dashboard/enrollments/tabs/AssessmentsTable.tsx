import { startCase } from 'lodash-es';
import { useCallback, useMemo } from 'react';

import AssessmentStatus from '@/components/elements/AssessmentStatus';
import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import {
  parseAndFormatDate,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  AssessmentFieldsFragment,
  EnrollmentFieldsFragment,
  GetEnrollmentAssessmentsDocument,
  GetEnrollmentAssessmentsQuery,
  GetEnrollmentAssessmentsQueryVariables,
  ProjectType,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const ceColumns: ColumnDef<AssessmentFieldsFragment>[] = [
  {
    header: 'CE Type',
    render: (a) => (
      <HmisEnum value={a.assessmentType} enumMap={HmisEnums.AssessmentType} />
    ),
    linkTreatment: true,
  },
  {
    header: 'Level',
    render: (a) => (
      <HmisEnum value={a.assessmentLevel} enumMap={HmisEnums.AssessmentLevel} />
    ),
  },
  {
    header: 'Location',
    render: (e) => e.assessmentLocation,
  },
];

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
      startCase(assessment.assessmentDetail?.role?.toLowerCase()),
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
  enrollment,
}: {
  clientId: string;
  enrollmentId: string;
  enrollment: EnrollmentFieldsFragment;
}) => {
  const rowLinkTo = useCallback(
    (assessment: AssessmentFieldsFragment) =>
      generateSafePath(DashboardRoutes.VIEW_ASSESSMENT, {
        clientId,
        enrollmentId,
        assessmentId: assessment.id,
      }),
    [clientId, enrollmentId]
  );
  const tableColumns = useMemo(
    () =>
      enrollment.project.projectType === ProjectType.Ce
        ? [...columns, ...ceColumns]
        : columns,
    [enrollment]
  );

  return (
    <GenericTableWithData<
      GetEnrollmentAssessmentsQuery,
      GetEnrollmentAssessmentsQueryVariables,
      AssessmentFieldsFragment
    >
      queryVariables={{ id: enrollmentId }}
      queryDocument={GetEnrollmentAssessmentsDocument}
      rowLinkTo={rowLinkTo}
      columns={tableColumns}
      pagePath='enrollment.assessments'
      noData='No assessments.'
      defaultPageSize={3}
      headerCellSx={() => ({ color: 'text.secondary' })}
    />
  );
};

export default AssessmentsTable;
