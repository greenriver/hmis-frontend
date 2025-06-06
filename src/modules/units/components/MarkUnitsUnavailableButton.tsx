import { Button, Typography } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import { emptyErrorState } from '@/modules/errors/util';
import { useMarkUnitsUnavailableMutation } from '@/types/gqlTypes';

interface Props {
  unitIds: string[];
  disabled: boolean;
}

const MarkUnitsAvailableButton: React.FC<Props> = ({ unitIds, disabled }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const tooltip = useMemo(() => {
    if (unitIds.length === 0)
      return 'No selected units are accepting referrals';
    if (disabled && unitIds.length > 0)
      return 'Not all of the selected units are accepting referrals';
  }, [disabled, unitIds.length]);

  const [markUnitsUnavailable, { loading, error }] =
    useMarkUnitsUnavailableMutation();

  const handleConfirm = useCallback(() => {
    markUnitsUnavailable({
      variables: { unitIds: unitIds },
      onCompleted: () => {
        setDialogOpen(false);
      },
    });
  }, [markUnitsUnavailable, unitIds]);

  return (
    <>
      <ButtonTooltipContainer title={tooltip}>
        <Button
          sx={{ width: '100%' }}
          disabled={disabled}
          onClick={() => setDialogOpen(true)}
        >
          Stop Accepting Referrals ({unitIds.length})
        </Button>
      </ButtonTooltipContainer>
      <ConfirmationDialog
        id='confirm-mark-units-unavailable'
        open={dialogOpen}
        title={'Stop Accepting Referrals for Unit(s)'}
        confirmText={`Yes, stop accepting referrals`}
        cancelText='Close'
        onConfirm={handleConfirm}
        onCancel={() => setDialogOpen(false)}
        loading={loading}
        errorState={{ ...emptyErrorState, apolloError: error }}
      >
        <Typography>
          Would you like to stop accepting referrals for {unitIds.length} unit
          {unitIds.length > 1 ? 's' : ''}?
        </Typography>
      </ConfirmationDialog>
    </>
  );
};

export default MarkUnitsAvailableButton;
