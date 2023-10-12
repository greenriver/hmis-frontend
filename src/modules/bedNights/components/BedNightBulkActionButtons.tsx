import { LoadingButton } from '@mui/lab';
import { ButtonProps, Stack } from '@mui/material';
import { useCallback, useState } from 'react';
import { useBedNightsOnDate } from '../hooks/useBedNightsOnDate';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import {
  formatDateForDisplay,
  formatDateForGql,
} from '@/modules/hmis/hmisUtil';
import apolloClient from '@/providers/apolloClient';
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
  const { enrollmentIdsWithBedNights, refetch } = useBedNightsOnDate(
    projectId,
    bedNightDate
  );

  const [addLoading, setAddLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);

  const [updateBedNights] = useUpdateBedNightsMutation({
    onCompleted: () => {
      // refetch bed nights for currently selected Bed Night Date, so button state updates.
      refetch();
      // refetch bed night (table) query, so that "Last Bed Night" column updates.
      apolloClient.refetchQueries({
        include: ['GetProjectEnrollmentsForBedNights'],
      });
    },
  });

  const onClickRemove = useCallback<NonNullable<ButtonProps['onClick']>>(
    (e) => {
      e.stopPropagation();
      const input = {
        projectId,
        enrollmentIds: selectedEnrollmentIds,
        action: BulkActionType.Remove,
        bedNightDate: formatDateForGql(bedNightDate) || '',
      };
      setRemoveLoading(true);
      updateBedNights({ variables: { input } });
    },
    [bedNightDate, projectId, selectedEnrollmentIds, updateBedNights]
  );
  const onClickAdd = useCallback<NonNullable<ButtonProps['onClick']>>(
    (e) => {
      e.stopPropagation();
      const input = {
        projectId,
        enrollmentIds: selectedEnrollmentIds,
        action: BulkActionType.Add,
        bedNightDate: formatDateForGql(bedNightDate) || '',
      };
      setAddLoading(true);
      updateBedNights({ variables: { input } });
    },
    [bedNightDate, projectId, selectedEnrollmentIds, updateBedNights]
  );

  if (!enrollmentIdsWithBedNights) return null;

  const assigned = selectedEnrollmentIds.filter((id) =>
    enrollmentIdsWithBedNights.has(id)
  );
  const notAssigned = selectedEnrollmentIds.filter(
    (id) => !enrollmentIdsWithBedNights.has(id)
  );

  const disabledMessage =
    assigned.length > 0 && notAssigned.length > 0
      ? `Some selected clients already have bed nights on ${formatDateForDisplay(
          bedNightDate,
          'MM/dd'
        )}.`
      : null;

  return (
    <ButtonTooltipContainer title={disabledMessage}>
      <Stack direction={'row'} gap={4}>
        {(!!disabledMessage || notAssigned.length > 0) && (
          <LoadingButton
            onClick={onClickAdd}
            disabled={!!disabledMessage}
            loading={addLoading}
          >{`Assign (${notAssigned.length}) Bed Night${
            notAssigned.length === 1 ? '' : 's'
          }`}</LoadingButton>
        )}
        {!disabledMessage && assigned.length > 0 && (
          <LoadingButton
            onClick={onClickRemove}
            loading={removeLoading}
            color='error'
          >{`Delete (${assigned.length}) Bed Night${
            assigned.length === 1 ? '' : 's'
          }`}</LoadingButton>
        )}
      </Stack>
    </ButtonTooltipContainer>
  );
};

export default BedNightBulkActionButtons;
