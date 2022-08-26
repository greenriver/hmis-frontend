import { useMemo } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';

import { Columns } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  AssessmentFieldsFragment,
  GetEnrollmentAssessmentsDocument,
  GetEnrollmentAssessmentsQuery,
  GetEnrollmentAssessmentsQueryVariables,
} from '@/types/gqlTypes';

const columns: Columns<AssessmentFieldsFragment>[] = [
  { header: 'ID', render: 'id' },
  {
    header: 'Type',
    render: (e) => e.assessmentType,
  },
  {
    header: 'Date',
    render: (e) =>
      e.assessmentDate ? parseAndFormatDate(e.assessmentDate) : 'Unknown',
  },
];
interface Props {
  clientId: string;
  enrollmentId: string;
}

const AssessmentsTable = ({ clientId, enrollmentId }: Props) => {
  const navigate = useNavigate();

  const handleRowClick = useMemo(() => {
    return (assessment: AssessmentFieldsFragment) =>
      navigate(
        generatePath(DashboardRoutes.VIEW_ASSESSMENT, {
          clientId,
          enrollmentId,
          assessmentId: assessment.id,
        })
      );
  }, [clientId, enrollmentId, navigate]);

  return (
    <GenericTableWithData<
      GetEnrollmentAssessmentsQuery,
      GetEnrollmentAssessmentsQueryVariables,
      AssessmentFieldsFragment
    >
      queryVariables={{ id: enrollmentId }}
      queryDocument={GetEnrollmentAssessmentsDocument}
      handleRowClick={handleRowClick}
      columns={columns}
      toNodes={(data: GetEnrollmentAssessmentsQuery) =>
        data.enrollment?.assessments?.nodes || []
      }
      toNodesCount={(data: GetEnrollmentAssessmentsQuery) =>
        data.enrollment?.assessments?.nodesCount
      }
    />
  );
};

export default AssessmentsTable;
