import { Chip } from '@mui/material';
import { capitalize } from 'lodash-es';
import { useCallback } from 'react';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  getCustomDataElementColumns,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import {
  ExternalFormSubmissionFieldsFragment,
  ExternalFormSubmissionFilterOptions,
  ExternalFormSubmissionStatus,
  GetProjectExternalFormSubmissionsDocument,
  GetProjectExternalFormSubmissionsQuery,
  GetProjectExternalFormSubmissionsQueryVariables,
} from '@/types/gqlTypes';

export type ExternalFormSubmissionFields = NonNullable<
  GetProjectExternalFormSubmissionsQuery['project']
>['externalFormSubmissions']['nodes'][number];

const ProjectSubmissionsTable = ({
  projectId,
  formDefinitionIdentifier,
}: {
  projectId: string;
  formDefinitionIdentifier: string;
}) => {
  const getColumnDefs = useCallback((rows: ExternalFormSubmissionFields[]) => {
    const customColumns = getCustomDataElementColumns(rows);
    return [
      {
        header: 'Status',
        linkTreatment: false,
        render: (s: ExternalFormSubmissionFieldsFragment) => (
          <Chip
            label={capitalize(s.status)}
            color={
              s.status === ExternalFormSubmissionStatus.New
                ? 'primary'
                : 'default'
            }
          />
        ),
      },
      {
        header: 'Date Submitted',
        linkTreatment: false,
        render: (s: ExternalFormSubmissionFieldsFragment) =>
          parseAndFormatDateTime(s.submittedAt),
      },
      ...customColumns,
    ];
  }, []);

  return (
    <GenericTableWithData<
      GetProjectExternalFormSubmissionsQuery,
      GetProjectExternalFormSubmissionsQueryVariables,
      ExternalFormSubmissionFields,
      ExternalFormSubmissionFilterOptions
    >
      queryVariables={{
        id: projectId,
        formDefinitionIdentifier: formDefinitionIdentifier,
      }}
      queryDocument={GetProjectExternalFormSubmissionsDocument}
      getColumnDefs={getColumnDefs}
      noData='No external form submissions'
      pagePath='project.externalFormSubmissions'
      recordType='ExternalFormSubmission'
      paginationItemName='submission'
      showFilters
      filterInputType='ExternalFormSubmissionFilterOptions'
    />
  );
};

export default ProjectSubmissionsTable;
