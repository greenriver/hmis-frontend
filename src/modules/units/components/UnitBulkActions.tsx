import { Stack } from '@mui/material';
import { useMemo } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import UnitBulkActionButton from '@/modules/units/components/UnitBulkActionButton';
import { useDeleteUnits } from '@/modules/units/hooks/useDeleteUnits';
import { evictUnitsQuery } from '@/modules/units/util';
import {
  MarkUnitsAvailableDocument,
  MarkUnitsUnavailableDocument,
  UnitTableRowFieldsFragment,
} from '@/types/gqlTypes';

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
  const { renderBulkDeleteButton } = useDeleteUnits({
    onSuccess: () => evictUnitsQuery(projectId, unitGroupId),
  });

  const { unitIdsToDelete, disableDelete, deleteTooltip } = useMemo(() => {
    const unitIdsToDelete = units.filter((u) => u.deletable).map((u) => u.id);
    const disabled = unitIdsToDelete.length < units.length;
    const tooltip = disabled
      ? 'Some selected units cannot be deleted'
      : undefined;
    return {
      unitIdsToDelete,
      disableDelete: disabled,
      deleteTooltip: tooltip,
    };
  }, [units]);

  const { unitIdsToMarkAvailable, disableMarkAvailable, markAvailableTooltip } =
    useMemo(() => {
      const unitIdsToMarkAvailable = units
        .filter((u) => u.canBeMarkedAvailableToday)
        .map((u) => u.id);
      const disabled = unitIdsToMarkAvailable.length === 0;
      const difference = units.length - unitIdsToMarkAvailable.length;
      let tooltip;
      if (disabled) tooltip = 'Selected units are already accepting referrals';

      // reasons they might not be able to be marked available (copied from backend):
      // - CE is not enabled, in which case the button won't appear
      // - Unit group doesn't have a workflow template, in which case the button won't appear
      // - Unit is already available - that is the case we describe in the tooltip
      // - Unit has occupants, in which case it won't be selectable in the table (this is brittle, depends on `deletable` logic)
      if (difference > 0)
        tooltip = `${difference} of ${units.length} selected units are already accepting referrals`;

      return {
        unitIdsToMarkAvailable,
        disableMarkAvailable: disabled,
        markAvailableTooltip: tooltip,
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

    const disabled =
      unitIdsToMarkUnavailable.length === 0 ||
      unitIdsToMarkAvailable.length > 0;

    let tooltip;
    if (unitIdsToMarkUnavailable.length === 0)
      tooltip = 'No selected units are accepting referrals';
    if (unitIdsToMarkAvailable.length > 0)
      tooltip = 'Not all of the selected units are accepting referrals';

    return {
      unitIdsToMarkUnavailable,
      disableMarkUnavailable: disabled,
      markUnavailableTooltip: tooltip,
    };
  }, [unitIdsToMarkAvailable.length, units]);

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
