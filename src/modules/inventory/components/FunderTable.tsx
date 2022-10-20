import { generatePath } from 'react-router-dom';

import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  FunderFieldsFragment,
  GetProjectFundersDocument,
  GetProjectFundersQuery,
  GetProjectFundersQueryVariables,
} from '@/types/gqlTypes';

const columns: ColumnDef<FunderFieldsFragment>[] = [
  {
    header: 'Funder',
    linkTreatment: true,
    render: (f: FunderFieldsFragment) => HmisEnums.FundingSource[f.funder],
  },
  { header: 'Grant ID', render: 'grantId' },
];

const FunderTable = ({ projectId }: { projectId: string }) => (
  <GenericTableWithData<
    GetProjectFundersQuery,
    GetProjectFundersQueryVariables,
    FunderFieldsFragment
  >
    queryVariables={{ id: projectId }}
    queryDocument={GetProjectFundersDocument}
    rowLinkTo={(funder) =>
      generatePath(Routes.EDIT_FUNDER, {
        projectId,
        funderId: funder.id,
      })
    }
    columns={columns}
    toNodes={(data: GetProjectFundersQuery) =>
      data.project?.funders?.nodes || []
    }
    toNodesCount={(data: GetProjectFundersQuery) =>
      data.project?.funders?.nodesCount
    }
    noData='No funding sources.'
  />
);
export default FunderTable;
