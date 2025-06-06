import { Button, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import { emptyErrorState } from '@/modules/errors/util';
import { useMarkUnitsAvailableMutation } from '@/types/gqlTypes';

interface Props {
  unitIds: string[]; // Unit IDs that are eligible to be marked available.
  // Calculated by the parent because it's used in determining whether the other bulk actions are disabled or not
  totalSelected: number; // Total number of units currently selected, some of which may be unimpacted by the bulk available action
}

// todo @martha - reduce repeated code? generic action with confirmation dialog or somewhere in between
const MarkUnitsAvailableButton: React.FC<Props> = ({
  unitIds,
  totalSelected,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const disabled = unitIds.length === 0;
  const difference = totalSelected - unitIds.length;

  const tooltip = useMemo(() => {
    if (disabled) {
      return 'Selected units are already accepting referrals';
    }

    if (difference > 0) {
      // reasons they might not be able to be marked available (copied from backend):
      // - CE is not enabled, in which case the button won't appear
      // - Unit group doesn't have a workflow template, in which case the button won't appear
      // - Unit is already available - that is the case we describe in the tooltip
      // - Unit has occupants, in which case it won't be selectable in the table (this is brittle, depends on `deletable` logic)
      return `${difference} of ${totalSelected} selected units are already accepting referrals`;
    }
  }, [difference, disabled, totalSelected]);

  const [markUnitsAvailable, { loading, error }] =
    useMarkUnitsAvailableMutation();

  const handleConfirm = useCallback(() => {
    markUnitsAvailable({
      variables: { unitIds: unitIds },
      onCompleted: () => {
        setDialogOpen(false);
      },
    });
  }, [markUnitsAvailable, unitIds]);

  return (
    <>
      <ButtonTooltipContainer title={tooltip}>
        <Button disabled={disabled} onClick={() => setDialogOpen(true)}>
          Start Accepting Referrals ({unitIds.length})
        </Button>
      </ButtonTooltipContainer>
      <ConfirmationDialog
        id='confirm-mark-units-available'
        open={dialogOpen}
        title={'Start Accepting Referrals for Unit(s)'}
        confirmText={`Yes, start accepting referrals`}
        cancelText='Close'
        onConfirm={handleConfirm}
        onCancel={() => setDialogOpen(false)}
        loading={loading}
        errorState={{ ...emptyErrorState, apolloError: error }}
      >
        <Typography>
          Would you like to start accepting referrals for {unitIds.length} unit
          {unitIds.length > 1 ? 's' : ''}?
        </Typography>
      </ConfirmationDialog>
    </>
  );
};

export default MarkUnitsAvailableButton;
