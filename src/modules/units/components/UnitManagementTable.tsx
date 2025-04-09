import { useCallback, useMemo } from 'react';
import UnitOccupants from './UnitOccupants';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { ColumnDef } from '@/components/elements/table/types';
import ReferralStatusChip from '@/modules/ce/components/ReferralStatusChip';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFilters } from '@/modules/hmis/filterUtil';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { useDeleteUnits } from '@/modules/units/hooks/useDeleteUnits';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  GetUnitsDocument,
  GetUnitsQuery,
  GetUnitsQueryVariables,
  UnitFieldsFragment,
  useMarkUnitsAvailableMutation,
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
                  unit.latestOpportunity &&
                  !unit.latestOpportunity.referral &&
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
                const opportunity = unit.latestOpportunity;
                const referral = opportunity?.referral;

                if (opportunity && !referral) return 'Available for referrals';

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

  const [
    markUnitsAvailable,
    { loading: availableLoading, error: availableError },
  ] = useMarkUnitsAvailableMutation();

  const [
    markUnitsUnavailable,
    { loading: unavailableLoading, error: unavailableError },
  ] = useMarkUnitsUnavailableMutation();

  const getCeActions = useCallback(
    (unit: UnitFieldsFragment) => {
      if (!canViewCoordinatedEntry) return [];

      // todo @martha - this logic isn't quite right:
      // -should be able to view opportunity either way (fine)
      // should only be able tom ark unavailable if the current opportunity doesn't have an accepted referral eitehr
      // should be able to mark available even if there isa  closed opportunity from the pats
      // do acceptedReferral and activeReferral need to stay separate?
      if (unit.latestOpportunity) {
        return [
          {
            title: 'View Opportunity',
            key: 'viewOpportunity',
            ariaLabel: `View Opportunity for Unit ${unit.id}`,
            to: generateSafePath(ProjectDashboardRoutes.OPPORTUNITY, {
              projectId,
              opportunityId: unit.latestOpportunity.id,
            }),
          },
          {
            title: 'Mark as Unavailable for Referrals',
            key: 'markUnavailable',
            ariaLabel: `Mark Unit ${unit.id} as Unavailable for Referrals`,
            onClick: () => {
              markUnitsUnavailable({ variables: { unitIds: [unit.id] } });
            },
            disabled: unit.latestOpportunity.referral?.active,
            disabledReason:
              'Unit with in-progress referral cannot be marked as unavailable',
          },
        ];
      }

      return [
        {
          title: 'Mark as Available for Referrals',
          key: 'markAvailable',
          ariaLabel: `Mark Unit ${unit.id} as Available for Referrals`,
          onClick: () => {
            markUnitsAvailable({ variables: { unitIds: [unit.id] } });
          },
        },
      ];
    },
    [
      canViewCoordinatedEntry,
      markUnitsAvailable,
      markUnitsUnavailable,
      projectId,
    ]
  );

  if (availableError) throw availableError;
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
        loading={availableLoading || unavailableLoading}
        loadingVariant='linear'
      />
      {renderSingleDeleteDialog()}
    </>
  );
};
export default UnitManagementTable;
