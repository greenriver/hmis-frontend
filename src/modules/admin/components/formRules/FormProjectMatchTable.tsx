import React from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { HmisEnums } from '@/types/gqlEnums';
import {
  FormProjectMatchFieldsFragment,
  GetFormProjectMatchesDocument,
  GetFormProjectMatchesQuery,
  GetFormProjectMatchesQueryVariables,
} from '@/types/gqlTypes';

const columns: ColumnDef<FormProjectMatchFieldsFragment>[] = [
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

const FormProjectMatchTable: React.FC<Props> = ({ formId }) => {
  return (
    <GenericTableWithData<
      GetFormProjectMatchesQuery,
      GetFormProjectMatchesQueryVariables,
      FormProjectMatchFieldsFragment
    >
      columns={columns}
      queryVariables={{ id: formId }}
      queryDocument={GetFormProjectMatchesDocument}
      pagePath='formDefinition.projectMatches'
      noData='No projects'
      paginationItemName='projects'
      recordType='FormProjectMatch'
      defaultPageSize={5}
    />
  );
};

export default FormProjectMatchTable;
