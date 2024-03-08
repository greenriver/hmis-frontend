import { Chip } from '@mui/material';
import { capitalize } from 'lodash-es';
import { useCallback, useState } from 'react';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  getCustomDataElementColumns,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import ProjectSubmissionsDialog from '@/modules/projects/components/ProjectSubmissionsDialog';
import {
  ExternalFormSubmissionFieldsFragment,
  ExternalFormSubmissionFilterOptions,
  ExternalFormSubmissionStatus,
  GetProjectExternalFormSubmissionsDocument,
  GetProjectExternalFormSubmissionsQuery,
  GetProjectExternalFormSubmissionsQueryVariables,
  PickListOption,
} from '@/types/gqlTypes';

export type ExternalFormSubmissionFields = NonNullable<
  GetProjectExternalFormSubmissionsQuery['project']
>['externalFormSubmissions']['nodes'][number];

const ProjectSubmissionsTable = ({
  projectId,
  formType,
}: {
  projectId: string;
  formType: PickListOption;
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
          parseAndFormatDate(s.submittedAt),
      },
      ...customColumns,
    ];
  }, []);

  const [selected, setSelected] =
    useState<ExternalFormSubmissionFieldsFragment | null>(null);

  return (
    <>
      <GenericTableWithData<
        GetProjectExternalFormSubmissionsQuery,
        GetProjectExternalFormSubmissionsQueryVariables,
        ExternalFormSubmissionFields,
        ExternalFormSubmissionFilterOptions
      >
        queryVariables={{
          id: projectId,
          formDefinitionIdentifier: formType.code,
        }}
        queryDocument={GetProjectExternalFormSubmissionsDocument}
        getColumnDefs={getColumnDefs}
        noData='No external form submissions'
        pagePath='project.externalFormSubmissions'
        recordType='ExternalFormSubmission'
        paginationItemName='submission'
        showFilters
        filterInputType='ExternalFormSubmissionFilterOptions'
        handleRowClick={(row) => setSelected(row)}
      />
      {selected && (
        <ProjectSubmissionsDialog
          submission={selected}
          open={!!selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
};

export default ProjectSubmissionsTable;
