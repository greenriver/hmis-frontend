import { LoadingButton } from '@mui/lab';
import { ButtonProps, Stack } from '@mui/material';
import { useCallback, useState } from 'react';
import { useBedNightsOnDate } from '../hooks/useBedNightsOnDate';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import {
  formatDateForDisplay,
  formatDateForGql,
} from '@/modules/hmis/hmisUtil';
import { BulkActionType, useUpdateBedNightsMutation } from '@/types/gqlTypes';

interface Props {
  selectedEnrollmentIds: string[];
  bedNightDate: Date;
  projectId: string;
}

const BedNightBulkActionButtons: React.FC<Props> = ({
  selectedEnrollmentIds,
  bedNightDate,
  projectId,
}) => {
  const { enrollmentIdsWithBedNights, refetchLoading, refetch } =
    useBedNightsOnDate(projectId, bedNightDate);

  const [updateBedNights, { loading: mutationLoading }] =
    useUpdateBedNightsMutation({
      onCompleted: () => refetch(),
    });
  const [lastAction, setLastAction] = useState<BulkActionType | null>(null);

  const onClickRemove = useCallback<NonNullable<ButtonProps['onClick']>>(
    (e) => {
      e.stopPropagation();
      const input = {
        enrollmentIds: selectedEnrollmentIds,
        action: BulkActionType.Remove,
        bedNightDate: formatDateForGql(bedNightDate) || '',
      };
      setLastAction(BulkActionType.Remove);
      updateBedNights({ variables: { input } });
    },
    [bedNightDate, selectedEnrollmentIds, updateBedNights]
  );
  const onClickAdd = useCallback<NonNullable<ButtonProps['onClick']>>(
    (e) => {
      e.stopPropagation();
      const input = {
        enrollmentIds: selectedEnrollmentIds,
        action: BulkActionType.Add,
        bedNightDate: formatDateForGql(bedNightDate) || '',
      };
      setLastAction(BulkActionType.Add);
      updateBedNights({ variables: { input } });
    },
    [bedNightDate, selectedEnrollmentIds, updateBedNights]
  );

  if (!enrollmentIdsWithBedNights) return null;

  const assigned = selectedEnrollmentIds.filter((id) =>
    enrollmentIdsWithBedNights.has(id)
  );
  const notAssigned = selectedEnrollmentIds.filter(
    (id) => !enrollmentIdsWithBedNights.has(id)
  );
  const hasBoth = assigned.length > 0 && notAssigned.length > 0;
  const hasBothDisabledMessage = hasBoth
    ? `To perform a bulk action, only select clients that all have the same bed night status on ${formatDateForDisplay(
        bedNightDate,
        'MM/dd'
      )}.`
    : null;

  return (
    <ButtonTooltipContainer title={hasBothDisabledMessage}>
      <Stack direction={'row'} gap={4}>
        <LoadingButton
          onClick={onClickAdd}
          disabled={!!hasBothDisabledMessage || notAssigned.length === 0}
          loading={
            (mutationLoading || refetchLoading) &&
            lastAction == BulkActionType.Add
          }
        >{`Assign (${notAssigned.length}) Bed Night${
          notAssigned.length === 1 ? '' : 's'
        }`}</LoadingButton>
        <LoadingButton
          onClick={onClickRemove}
          disabled={!!hasBothDisabledMessage || assigned.length === 0}
          loading={
            (mutationLoading || refetchLoading) &&
            lastAction == BulkActionType.Remove
          }
          color='error'
        >{`Delete (${assigned.length}) Bed Night${
          assigned.length === 1 ? '' : 's'
        }`}</LoadingButton>
      </Stack>
    </ButtonTooltipContainer>
  );
};

export default BedNightBulkActionButtons;
