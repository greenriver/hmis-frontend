import { useMemo } from 'react';

import { evictUnitPickList } from '../util';

import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import LiveTextInput from '@/modules/dataFetching/components/LiveTextInput';
import {
  GetUnitsDocument,
  GetUnitsQuery,
  GetUnitsQueryVariables,
  UnitFieldsFragment,
  UpdateUnitsDocument,
  UpdateUnitsMutation,
  UpdateUnitsMutationVariables,
} from '@/types/gqlTypes';

// UNUSED!

const UnitsTable = ({ projectId }: { projectId: string }) => {
  const unitColumns: ColumnDef<UnitFieldsFragment>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Unit Name',
        width: '30%',
        render: (unit: UnitFieldsFragment) => (
          <LiveTextInput<UpdateUnitsMutation, UpdateUnitsMutationVariables>
            key={`${unit.id}-name`}
            queryDocument={UpdateUnitsDocument}
            initialValue={unit.name || ''}
            constructVariables={(name) => {
              return {
                input: { projectId, unitIds: [unit.id], name: name || null },
              };
            }}
            getValueFromResponse={(data) => {
              evictUnitPickList(projectId);
              const units = data?.updateUnits?.units || [];
              if (units.length === 1) {
                return units[0].name || '';
              }
              return '';
            }}
          />
        ),
      },
      // NOTE!!! Leaving this here so we can do something similar for live-update selection of UnitType, if desired
      // {
      //   key: 'unit',
      //   header: 'Unit',
      //   width: '35%',
      //   render: (bed) => (
      //     <LiveSelect<UpdateBedsMutation, UpdateBedsMutationVariables>
      //       key={
      //         // re-render if unit name changes
      //         pickList.find(({ code }) => code === bed.unit.id)?.label || bed.id
      //       }
      //       options={pickList}
      //       textInputProps={{
      //         placeholder: 'Select unit',
      //       }}
      //       value={pickList.find(({ code }) => code === bed.unit.id) || null}
      //       size='small'
      //       disableClearable
      //       queryDocument={UpdateBedsDocument}
      //       constructVariables={(option) => {
      //         return {
      //           input: {
      //             inventoryId,
      //             bedIds: [bed.id],
      //             unit: option?.code,
      //             gender: bed.gender,
      //             name: bed.name,
      //           },
      //         };
      //       }}
      //       getOptionFromResponse={(data) => {
      //         evictUnitsQuery(inventoryId);
      //         const beds = data?.updateBeds?.beds || [];
      //         if (beds && beds.length === 1) {
      //           const unitId = beds[0].unit.id;
      //           return pickList.find(({ code }) => code === unitId) || null;
      //         }
      //         return null;
      //       }}
      //     />
      //   ),
      // },
    ],
    [projectId]
  );

  return (
    <>
      <GenericTableWithData<
        GetUnitsQuery,
        GetUnitsQueryVariables,
        UnitFieldsFragment
      >
        defaultPageSize={10}
        queryVariables={{ id: projectId }}
        queryDocument={GetUnitsDocument}
        columns={unitColumns}
        pagePath='project.units'
        noData='No units.'
      />
    </>
  );
};

export default UnitsTable;
