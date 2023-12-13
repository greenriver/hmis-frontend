import React from 'react';
import { generatePath } from 'react-router-dom';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { AdminDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  GetFormDefinitionsDocument,
  GetFormDefinitionsQuery,
  GetFormDefinitionsQueryVariables,
} from '@/types/gqlTypes';

type Row = NonNullable<GetFormDefinitionsQuery['formDefinitions']>['nodes'][0];

const columns: ColumnDef<Row>[] = [
  {
    header: 'Name',
    render: 'title',
    width: '300px',
    linkTreatment: true,
  },
  {
    header: 'Form Type',
    render: ({ role }) => {
      if (!role) return null;
      // if (role === FormRole.OccurrencePoint) {
      //   return 'Occurrence Point (Enrollment Details)';
      // }
      return HmisEnums.FormRole[role];
    },
  },
  {
    header: 'Applicability Rules',
    render: ({ formRules }) => formRules.nodesCount,
  },
  // TODO ADD: # projects active in
  // TODO ADD: version
  // TODO ADD: status
  // TODO ADD: last updated...
];

const FormDefinitionTable: React.FC = () => {
  return (
    <>
      <GenericTableWithData<
        GetFormDefinitionsQuery,
        GetFormDefinitionsQueryVariables,
        Row
      >
        queryVariables={{}}
        queryDocument={GetFormDefinitionsDocument}
        columns={columns}
        pagePath='formDefinitions'
        showFilters
        recordType='FormDefinition'
        // filterInputType='FormRuleFilterOptions'
        paginationItemName='form'
        rowLinkTo={(row) =>
          generatePath(AdminDashboardRoutes.VIEW_FORM, { formId: row.id })
        }
        // defaultFilters={{
        //   activeStatus: [ActiveStatus.Active],
        //   systemForm: [SystemStatus.NonSystem],
        // }}
      />
    </>
  );
};
export default FormDefinitionTable;
