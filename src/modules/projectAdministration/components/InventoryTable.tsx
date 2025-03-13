import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ButtonLink from '@/components/elements/ButtonLink';
import { ColumnDef } from '@/components/elements/table/types';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ViewRecordDialog from '@/modules/form/components/ViewRecordDialog';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { cache } from '@/providers/apolloClient';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  DeleteInventoryDocument,
  DeleteInventoryMutation,
  DeleteInventoryMutationVariables,
  RecordFormRole,
  GetProjectInventoriesDocument,
  InventoryFieldsFragment,
  ProjectType,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const columns: ColumnDef<InventoryFieldsFragment>[] = [
  {
    header: 'Household Type',
    key: 'householdType',
    render: (i: InventoryFieldsFragment) => (
      <HmisEnum value={i.householdType} enumMap={HmisEnums.HouseholdType} />
    ),
  },
  {
    header: 'Active Period',
    key: 'activePeriod',
    render: (i: InventoryFieldsFragment) =>
      parseAndFormatDateRange(i.inventoryStartDate, i.inventoryEndDate),
  },
  {
    header: 'CoC',
    render: 'cocCode',
    key: 'coc',
  },
];

const InventoryTable = () => {
  const { project } = useProjectDashboardContext();

  const [viewingRecord, setViewingRecord] = useState<
    InventoryFieldsFragment | undefined
  >();

  const tableColumns = useMemo(() => {
    return [
      ...columns,
      ...(project.projectType &&
      [ProjectType.EsNbn, ProjectType.EsEntryExit].includes(project.projectType)
        ? [
            {
              header: 'Availability',
              key: 'availability',
              render: (row: InventoryFieldsFragment) => (
                <HmisEnum
                  value={row.availability}
                  enumMap={HmisEnums.Availability}
                />
              ),
            },
            {
              header: 'Bed Type',
              key: 'bed type',
              render: (row: InventoryFieldsFragment) => (
                <HmisEnum value={row.esBedType} enumMap={HmisEnums.BedType} />
              ),
            },
          ]
        : []),
      {
        header: 'Units',
        key: 'units',
        render: 'unitInventory' as keyof InventoryFieldsFragment,
      },
      {
        header: 'Beds',
        key: 'beds',
        render: 'bedInventory' as keyof InventoryFieldsFragment,
      },
    ];
  }, [project]);

  const navigate = useNavigate();
  const onSuccessfulDelete = useCallback(() => {
    setViewingRecord(undefined);
    cache.evict({ id: `Project:${project.id}`, fieldName: 'inventories' });
    navigate(
      generateSafePath(ProjectDashboardRoutes.INVENTORY, {
        projectId: project.id,
      })
    );
  }, [project, navigate]);
  const pickListArgs = useMemo(() => ({ projectId: project.id }), [project]);

  return (
    <>
      <GenericTableWithData
        queryVariables={{ id: project.id }}
        queryDocument={GetProjectInventoriesDocument}
        columns={tableColumns}
        pagePath='project.inventories'
        noData='No inventory'
        handleRowClick={(record) => setViewingRecord(record)}
        rowActionTitle='View Inventory'
      />
      {viewingRecord && (
        <ViewRecordDialog<InventoryFieldsFragment>
          record={viewingRecord}
          formRole={RecordFormRole.Inventory}
          title='Inventory'
          open={!!viewingRecord}
          onClose={() => setViewingRecord(undefined)}
          pickListArgs={pickListArgs}
          actions={
            project.access.canEditProjectDetails && (
              <>
                <ButtonLink
                  to={generateSafePath(ProjectDashboardRoutes.EDIT_INVENTORY, {
                    projectId: project.id,
                    inventoryId: viewingRecord.id,
                  })}
                  data-testid='updateInventoryButton'
                >
                  Edit
                </ButtonLink>
                <DeleteMutationButton<
                  DeleteInventoryMutation,
                  DeleteInventoryMutationVariables
                >
                  queryDocument={DeleteInventoryDocument}
                  variables={{ input: { id: viewingRecord.id } }}
                  idPath={'deleteInventory.inventory.id'}
                  recordName='Inventory'
                  onSuccess={onSuccessfulDelete}
                >
                  Delete
                </DeleteMutationButton>
              </>
            )
          }
        />
      )}
    </>
  );
};
export default InventoryTable;
