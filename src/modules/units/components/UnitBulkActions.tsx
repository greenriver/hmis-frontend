import { Stack } from '@mui/material';
import { useMemo } from 'react';
import MarkUnitsAvailableButton from './MarkUnitsAvailableButton';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import MarkUnitsUnavailableButton from '@/modules/units/components/MarkUnitsUnavailableButton';
import { useDeleteUnits } from '@/modules/units/hooks/useDeleteUnits';
import { evictUnitsQuery } from '@/modules/units/util';
import { UnitTableRowFieldsFragment } from '@/types/gqlTypes';

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

  const { unitIdsToDelete, unitIdsToMarkAvailable, unitIdsToMarkUnavailable } =
    useMemo(() => {
      return {
        unitIdsToDelete: units.filter((u) => u.deletable).map((u) => u.id),
        unitIdsToMarkAvailable: units
          .filter((u) => u.canBeMarkedAvailableToday)
          .map((u) => u.id),
        unitIdsToMarkUnavailable: units
          .filter((u) => u.canBeMarkedUnavailable)
          .map((u) => u.id),
      };
    }, [units]);

  const disableDelete = unitIdsToDelete.length < units.length;

  return (
    <Stack gap={2} direction='row'>
      {canAcceptReferrals && (
        <>
          <MarkUnitsAvailableButton
            unitIds={unitIdsToMarkAvailable}
            totalSelected={units.length}
          />
          <MarkUnitsUnavailableButton
            unitIds={unitIdsToMarkUnavailable}
            disabled={
              unitIdsToMarkUnavailable.length === 0 ||
              unitIdsToMarkAvailable.length > 0
            }
          />
        </>
      )}

      <ButtonTooltipContainer
        title={
          disableDelete ? 'Some selected units cannot be deleted' : undefined
        }
      >
        {renderBulkDeleteButton(unitIdsToDelete, disableDelete)}
      </ButtonTooltipContainer>
    </Stack>
  );
};

export default UnitBulkActions;
