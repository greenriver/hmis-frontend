import { Stack } from '@mui/material';
import { useMemo } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import UnitBulkActionButton from '@/modules/units/components/UnitBulkActionButton';
import { useDeleteUnits } from '@/modules/units/hooks/useDeleteUnits';
import { evictUnitsQuery } from '@/modules/units/util';
import {
  GetUnitsDocument,
  MarkUnitsAvailableDocument,
  MarkUnitsUnavailableDocument,
  UnitTableRowFieldsFragment,
} from '@/types/gqlTypes';

// Local util for generating the correct tooltip for a bulk action button.
const getTooltip = ({
  selectedUnitsCount,
  eligibleUnitsCount,
  ineligibleText,
}: {
  selectedUnitsCount: number;
  eligibleUnitsCount: number;
  ineligibleText: string;
}) => {
  if (selectedUnitsCount === 0) return;
  if (eligibleUnitsCount === 0) {
    return `Selected units ${ineligibleText}`;
  }
  if (eligibleUnitsCount < selectedUnitsCount) {
    return `${selectedUnitsCount - eligibleUnitsCount} of ${selectedUnitsCount} selected units ${ineligibleText}`;
  }
};

interface Props {
  projectId: string;
  unitGroupId: string;
  units: UnitTableRowFieldsFragment[];
  canAcceptReferrals: boolean;
}

const UnitBulkActions: React.FC<Props> = ({
  projectId,
  unitGroupId,
  units,
  canAcceptReferrals,
}) => {
  // This component's philosophy is to let the user do what they are trying to
  // do as long as it's allowed on *any* of the units they have selected.
  // For example, if they have selected 2 units, 1 of which is not deletable,
  // the Delete button will be enabled, with a tooltip that says
  // "1 of 2 selected units cannot be deleted".

  const { renderBulkDeleteButton } = useDeleteUnits({
    onSuccess: () => evictUnitsQuery(projectId, unitGroupId), // refresh the UnitVisualizationCharts
    refetchQueries: [GetUnitsDocument], // *also* pass refetchQueries with awaitRefetchQueries, so the UI correctly displays loading state instead of jittering
    awaitRefetchQueries: true,
  });

  const { unitIdsToDelete, disableDelete, deleteTooltip } = useMemo(() => {
    const unitIdsToDelete = units.filter((u) => u.deletable).map((u) => u.id);

    return {
      unitIdsToDelete,
      disableDelete: unitIdsToDelete.length === 0,
      deleteTooltip: getTooltip({
        selectedUnitsCount: units.length,
        eligibleUnitsCount: unitIdsToDelete.length,
        ineligibleText: 'cannot be deleted',
      }),
    };
  }, [units]);

  const { unitIdsToMarkAvailable, disableMarkAvailable, markAvailableTooltip } =
    useMemo(() => {
      const unitIdsToMarkAvailable = units
        .filter((u) => u.canBeMarkedAvailableToday)
        .map((u) => u.id);

      return {
        unitIdsToMarkAvailable,
        disableMarkAvailable: unitIdsToMarkAvailable.length === 0,
        markAvailableTooltip: getTooltip({
          selectedUnitsCount: units.length,
          eligibleUnitsCount: unitIdsToMarkAvailable.length,

          // "Already accepting referrals" is NOT actually the only reason units might be ineligible,
          // but it's helpful UI simplification.
          // All reasons they might not be able to be marked available (copied from backend):
          // - CE is not enabled, in which case the button won't appear
          // - Unit group doesn't have a workflow template, in which case the button won't appear
          // - Unit is already available - that is the case we describe in the tooltip
          // - Unit has occupants, in which case it won't be selectable in the table (this is brittle, depends on `deletable` logic)
          ineligibleText: 'are already accepting referrals',
        }),
      };
    }, [units]);

  const {
    unitIdsToMarkUnavailable,
    disableMarkUnavailable,
    markUnavailableTooltip,
  } = useMemo(() => {
    const unitIdsToMarkUnavailable = units
      .filter((u) => u.canBeMarkedUnavailable)
      .map((u) => u.id);

    return {
      unitIdsToMarkUnavailable,
      disableMarkUnavailable: unitIdsToMarkUnavailable.length === 0,
      markUnavailableTooltip: getTooltip({
        selectedUnitsCount: units.length,
        eligibleUnitsCount: unitIdsToMarkUnavailable.length,
        ineligibleText: 'are not accepting referrals',
      }),
    };
  }, [units]);

  return (
    <Stack gap={1} my={1}>
      {canAcceptReferrals && (
        <>
          <UnitBulkActionButton
            action='start'
            unitIds={unitIdsToMarkAvailable}
            queryDocument={MarkUnitsAvailableDocument}
            tooltip={markAvailableTooltip}
            disabled={disableMarkAvailable}
          />
          <UnitBulkActionButton
            action='stop'
            unitIds={unitIdsToMarkUnavailable}
            queryDocument={MarkUnitsUnavailableDocument}
            tooltip={markUnavailableTooltip}
            disabled={disableMarkUnavailable}
          />
        </>
      )}

      <ButtonTooltipContainer title={deleteTooltip}>
        {renderBulkDeleteButton(unitIdsToDelete, disableDelete)}
      </ButtonTooltipContainer>
    </Stack>
  );
};

export default UnitBulkActions;
