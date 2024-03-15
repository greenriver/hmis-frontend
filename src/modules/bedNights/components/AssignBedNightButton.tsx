import CheckIcon from '@mui/icons-material/Check';
import { LoadingButton } from '@mui/lab';
import { ButtonProps } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useBedNightsOnDate } from '../hooks/useBedNightsOnDate';
import { formatDateForGql } from '@/modules/hmis/hmisUtil';
import apolloClient from '@/providers/apolloClient';
import { BulkActionType, useUpdateBedNightsMutation } from '@/types/gqlTypes';
interface Props {
  enrollmentId: string;
  bedNightDate: Date;
  editable: boolean;
  projectId: string;
}

const AssignBedNightButton: React.FC<Props> = ({
  enrollmentId,
  bedNightDate,
  editable,
  projectId,
}) => {
  const { enrollmentIdsWithBedNights, refetchLoading, refetch } =
    useBedNightsOnDate(projectId, bedNightDate);

  const [updateBedNights, { loading: mutationLoading }] =
    useUpdateBedNightsMutation({
      onCompleted: () => {
        // refetch bed nights for currently selected Bed Night Date, so button state updates.
        refetch();
        // refetch bed night (table) query, so that "Last Bed Night" column updates.
        apolloClient.refetchQueries({
          include: ['GetProjectEnrollmentsForBedNights'],
        });
      },
    });

  const isAssignedOnDate = useMemo(
    () =>
      enrollmentIdsWithBedNights &&
      enrollmentIdsWithBedNights.has(enrollmentId),
    [enrollmentId, enrollmentIdsWithBedNights]
  );

  const onClick = useCallback<NonNullable<ButtonProps['onClick']>>(
    (e) => {
      e.stopPropagation();
      const input = {
        projectId,
        enrollmentIds: [enrollmentId],
        action: isAssignedOnDate ? BulkActionType.Remove : BulkActionType.Add,
        bedNightDate: formatDateForGql(bedNightDate) || '',
      };
      updateBedNights({ variables: { input } });
    },
    [bedNightDate, enrollmentId, isAssignedOnDate, projectId, updateBedNights]
  );

  return (
    <LoadingButton
      disabled={!enrollmentIdsWithBedNights || !editable}
      onClick={onClick}
      loading={mutationLoading || refetchLoading}
      startIcon={isAssignedOnDate ? <CheckIcon /> : undefined}
      fullWidth
      variant={isAssignedOnDate ? 'contained' : 'gray'}
    >
      {isAssignedOnDate ? 'Bed Assigned' : 'Assign Bed'}
    </LoadingButton>
  );
};

export default AssignBedNightButton;