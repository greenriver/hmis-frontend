import React from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { HmisEnums } from '@/types/gqlEnums';
import {
  FormApplicableProjectFieldsFragment,
  GetFormApplicableProjectsDocument,
  GetFormApplicableProjectsQuery,
  GetFormApplicableProjectsQueryVariables,
} from '@/types/gqlTypes';

const columns: ColumnDef<FormApplicableProjectFieldsFragment>[] = [
  {
    header: 'Project',
    render: 'projectName',
  },
  {
    header: 'Organization',
    render: 'organizationName',
  },
  {
    header: 'Applies to',
    render: (row) => HmisEnums.DataCollectedAbout[row.dataCollectedAbout],
  },
];

interface Props {
  formId: string;
}

const FormApplicableProjectsTable: React.FC<Props> = ({ formId }) => {
  return (
    <GenericTableWithData<
      GetFormApplicableProjectsQuery,
      GetFormApplicableProjectsQueryVariables,
      FormApplicableProjectFieldsFragment
    >
      columns={columns}
      queryVariables={{ id: formId }}
      queryDocument={GetFormApplicableProjectsDocument}
      pagePath='formDefinition.applicableProjects'
      noData='No projects'
      recordType='ApplicableProject'
      defaultPageSize={5}
      noPaginate
    />
  );
};

export default FormApplicableProjectsTable;
