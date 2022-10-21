import { isNil } from 'lodash-es';
import { generatePath } from 'react-router-dom';

import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import { Routes } from '@/routes/routes';
import {
  GetProjectProjectCocsDocument,
  GetProjectProjectCocsQuery,
  GetProjectProjectCocsQueryVariables,
  ProjectCocFieldsFragment,
} from '@/types/gqlTypes';

const columns: ColumnDef<ProjectCocFieldsFragment>[] = [
  {
    header: 'CoC Code',
    linkTreatment: true,
    render: 'cocCode',
  },
  {
    header: 'Geocode',
    render: 'geocode',
  },
  {
    header: 'Address',
    render: (c: ProjectCocFieldsFragment) =>
      [c.address1, c.address2, c.city, c.state, c.zip]
        .filter((f) => !isNil(f))
        .join(', '),
  },
];

const Table = ({ projectId }: { projectId: string }) => (
  <GenericTableWithData<
    GetProjectProjectCocsQuery,
    GetProjectProjectCocsQueryVariables,
    ProjectCocFieldsFragment
  >
    queryVariables={{ id: projectId }}
    queryDocument={GetProjectProjectCocsDocument}
    rowLinkTo={(record) =>
      generatePath(Routes.EDIT_COC, {
        projectId,
        cocId: record.id,
      })
    }
    columns={columns}
    toNodes={(data: GetProjectProjectCocsQuery) =>
      data.project?.projectCocs?.nodes || []
    }
    toNodesCount={(data: GetProjectProjectCocsQuery) =>
      data.project?.projectCocs?.nodesCount
    }
    noData='No Project CoC records.'
  />
);
export default Table;
