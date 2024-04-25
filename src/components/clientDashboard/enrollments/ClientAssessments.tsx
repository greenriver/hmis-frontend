import { Paper } from '@mui/material';
import { useCallback, useMemo } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import {
  ASSESSMENT_COLUMNS,
  ASSESSMENT_ENROLLMENT_COLUMNS,
  assessmentRowLinkTo,
  getAssessmentTypeFilter,
} from '@/modules/assessments/util';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import AssessmentDateWithStatusIndicator from '@/modules/hmis/components/AssessmentDateWithStatusIndicator';
import { assessmentDescription } from '@/modules/hmis/hmisUtil';
import {
  AssessmentSortOption,
  GetClientAssessmentsDocument,
  GetClientAssessmentsQuery,
  GetClientAssessmentsQueryVariables,
} from '@/types/gqlTypes';

export type ClientAssessmentType = NonNullable<
  NonNullable<GetClientAssessmentsQuery['client']>['assessments']
>['nodes'][0];

const columns: ColumnDef<ClientAssessmentType>[] = [
  ASSESSMENT_COLUMNS.linkedType,
  {
    header: 'Assessment Date',
    render: (a) => <AssessmentDateWithStatusIndicator assessment={a} />,
    ariaLabel: (row) => assessmentDescription(row),
  },
  {
    header: 'Project Name',
    render: (row) => row.enrollment.projectName,
  },
  ASSESSMENT_ENROLLMENT_COLUMNS.period,
];

const ClientAssessments = () => {
  const { clientId } = useSafeParams() as { clientId: string };

  const rowLinkTo = useCallback(
    (record: ClientAssessmentType) => assessmentRowLinkTo(record, clientId),
    [clientId]
  );

  const filter = useMemo(() => getAssessmentTypeFilter(), []);

  return (
    <>
      <PageTitle title='Assessments' />
      <Paper>
        <GenericTableWithData<
          GetClientAssessmentsQuery,
          GetClientAssessmentsQueryVariables,
          ClientAssessmentType
        >
          showFilters
          queryVariables={{ id: clientId }}
          queryDocument={GetClientAssessmentsDocument}
          rowLinkTo={rowLinkTo}
          columns={columns}
          pagePath='client.assessments'
          fetchPolicy='cache-and-network'
          noData='No assessments'
          recordType='Assessment'
          filters={(filters) => {
            return { ...filters, type: filter };
          }}
          defaultSortOption={AssessmentSortOption.AssessmentDate}
        />
      </Paper>
    </>
  );
};

export default ClientAssessments;
