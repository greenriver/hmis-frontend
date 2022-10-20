import { generatePath } from 'react-router-dom';

import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/components/elements/GenericTableWithData';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  GetProjectInventoriesDocument,
  GetProjectInventoriesQuery,
  GetProjectInventoriesQueryVariables,
  InventoryFieldsFragment,
} from '@/types/gqlTypes';

const columns: ColumnDef<InventoryFieldsFragment>[] = [
  {
    header: 'CoC Code',
    linkTreatment: true,
    render: 'cocCode',
  },
  {
    header: 'Household Type',
    render: (i: InventoryFieldsFragment) =>
      i.householdType && HmisEnums.HouseholdType[i.householdType],
  },
  {
    header: 'Units',
    render: 'unitInventory',
  },
  {
    header: 'Beds',
    render: 'bedInventory',
  },
];

const InventoryTable = ({ projectId }: { projectId: string }) => (
  <GenericTableWithData<
    GetProjectInventoriesQuery,
    GetProjectInventoriesQueryVariables,
    InventoryFieldsFragment
  >
    queryVariables={{ id: projectId }}
    queryDocument={GetProjectInventoriesDocument}
    rowLinkTo={(record) =>
      generatePath(Routes.EDIT_INVENTORY, {
        projectId,
        inventoryId: record.id,
      })
    }
    columns={columns}
    toNodes={(data: GetProjectInventoriesQuery) =>
      data.project?.inventories?.nodes || []
    }
    toNodesCount={(data: GetProjectInventoriesQuery) =>
      data.project?.inventories?.nodesCount
    }
    noData='No inventory.'
  />
);
export default InventoryTable;
