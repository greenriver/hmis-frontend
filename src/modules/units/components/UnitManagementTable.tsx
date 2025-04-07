import { useCallback, useMemo, useState } from 'react';
import UnitOccupants from './UnitOccupants';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { ColumnDef } from '@/components/elements/table/types';
import ReferralStatusChip from '@/modules/ce/components/ReferralStatusChip';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import MarkUnitsAvailableDialog from '@/modules/units/components/MarkUnitsAvailableDialog';
import { useDeleteUnits } from '@/modules/units/hooks/useDeleteUnits';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  GetUnitsDocument,
  GetUnitsQuery,
  GetUnitsQueryVariables,
  UnitFieldsFragment,
  useMarkUnitsUnavailableMutation,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const UnitManagementTable = ({
  projectId,
  allowDeleteUnits,
}: {
  projectId: string;
  allowDeleteUnits: boolean;
}) => {
  const { setUnitToDelete, renderSingleDeleteDialog, renderBulkDeleteButton } =
    useDeleteUnits({
      projectId,
    });

  const [canViewCoordinatedEntry] = useHasRootPermissions([
    'canViewCoordinatedEntry',
  ]);

  const columns: ColumnDef<UnitFieldsFragment>[] = useMemo(() => {
    return [
      {
        header: 'Unit Type',
        key: 'unitType',
        render: (unit) => unit.unitType?.description,
      },
      {
        header: 'Unit ID',
        key: 'unitId',
        render: 'id',
      },
      {
        header: 'Active Status',
        key: 'activeStatus',
        render: (unit) => (unit.occupants.length > 0 ? 'Filled' : 'Available'),
      },
      {
        header: 'Client(s)',
        key: 'clients',
        render: (unit) => <UnitOccupants unit={unit} />,
      },
      ...(canViewCoordinatedEntry
        ? [
            {
              header: 'Accepting Referrals?',
              key: 'available',
              render: (unit: UnitFieldsFragment) => {
                if (
                  unit.activeOpportunity &&
                  !unit.activeOpportunity.activeReferral &&
                  unit.occupants.length === 0
                ) {
                  return 'Yes';
                }
                return 'No';
              },
            },
            {
              header: 'Referral Status',
              key: 'referralStatus',
              render: (unit: UnitFieldsFragment) => {
                const referral = unit.activeOpportunity?.activeReferral;
                // todo @martha - should show successful referral status, but that's not returned on activeOpportunity
                if (referral)
                  return <ReferralStatusChip status={referral.status} />;
              },
            },
          ]
        : []),
    ];
  }, [canViewCoordinatedEntry]);

  const filters = useFilters({
    type: 'UnitFilterOptions',
  });

  const hasSecondaryActions = useMemo(() => {
    return allowDeleteUnits || canViewCoordinatedEntry; // TODO(#7395)
  }, [allowDeleteUnits, canViewCoordinatedEntry]);

  const [availableUnits, setAvailableUnits] = useState<string[] | undefined>(
    undefined
  );
  const [
    markUnitsUnavailable,
    { loading: unavailableLoading, error: unavailableError },
  ] = useMarkUnitsUnavailableMutation();

  const getCeActions = useCallback(
    (unit: UnitFieldsFragment) => {
      if (!canViewCoordinatedEntry) return [];

      return [
        ...(!!unit.activeOpportunity
          ? [
              {
                title: 'View Opportunity',
                key: 'viewOpportunity',
                ariaLabel: `View Opportunity for Unit ${unit.id}`,
                to: generateSafePath(ProjectDashboardRoutes.OPPORTUNITY, {
                  projectId,
                  opportunityId: unit.activeOpportunity.id,
                }),
              },
            ]
          : []),
        {
          title: 'Mark as Available for Referrals',
          key: 'markAvailable',
          ariaLabel: `Mark Unit ${unit.id} as Available for Referrals`,
          onClick: () => setAvailableUnits([unit.id]),
          disabled: unit.occupants.length > 0 || !!unit.activeOpportunity,
          disabledReason:
            unit.occupants.length > 0
              ? 'Currently assigned units cannot be marked available'
              : 'Unit is already available',
        },
        {
          title: 'Mark as Unavailable for Referrals',
          key: 'markUnavailable',
          ariaLabel: `Mark Unit ${unit.id} as Unavailable for Referrals`,
          onClick: () => {
            markUnitsUnavailable({ variables: { unitIds: [unit.id] } });
          },
          disabled:
            unit.occupants.length > 0 ||
            !unit.activeOpportunity ||
            !!unit.activeOpportunity.activeReferral,
          disabledReason:
            unit.occupants.length > 0
              ? 'Currently assigned units cannot be marked unavailable'
              : !unit.activeOpportunity
                ? 'Unit is unavailable'
                : 'Unit has an active referral',
        },
      ];
    },
    [canViewCoordinatedEntry, markUnitsUnavailable, projectId]
  );

  if (unavailableError) throw unavailableError;

  const rowSecondaryActionConfigs = useCallback(
    (unit: UnitFieldsFragment) => {
      return [
        ...(allowDeleteUnits
          ? [
              {
                title: 'Delete Unit',
                key: 'delete',
                ariaLabel: `Delete Unit ${unit.id}`,
                onClick: () => setUnitToDelete(unit.id),
                disabled: unit.occupants.length > 0,
                disabledReason: 'Currently assigned units cannot be deleted',
              },
            ]
          : []),
        ...getCeActions(unit),
      ];
    },
    [allowDeleteUnits, getCeActions, setUnitToDelete]
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
        columns={columns}
        pagePath='project.units'
        noData='No units'
        selectable={allowDeleteUnits ? 'row' : undefined}
        isRowSelectable={(row) => row.occupants.length === 0}
        filters={filters}
        recordType='Unit'
        EnhancedTableToolbarProps={{
          title: 'Unit Management',
          renderBulkAction: allowDeleteUnits
            ? (selectedUnitIds) => (
                <ButtonTooltipContainer title='Delete Selected Units'>
                  {renderBulkDeleteButton(selectedUnitIds as string[])}
                </ButtonTooltipContainer>
              )
            : undefined,
        }}
        rowName={(row) => `${row.unitType?.description} - ${row.id}`}
        rowSecondaryActionConfigs={
          hasSecondaryActions ? rowSecondaryActionConfigs : undefined
        }
        loading={unavailableLoading}
        loadingVariant='linear'
      />
      {renderSingleDeleteDialog()}
      <MarkUnitsAvailableDialog
        unitIds={availableUnits}
        open={!!availableUnits}
        onClose={() => setAvailableUnits(undefined)}
      />
    </>
  );
};
export default UnitManagementTable;
