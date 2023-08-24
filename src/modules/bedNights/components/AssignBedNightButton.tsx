import { ObservableQuery } from '@apollo/client';
import CheckIcon from '@mui/icons-material/Check';
import { LoadingButton } from '@mui/lab';
import { ButtonProps } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useBedNightsOnDate } from '../hooks/useBedNightsOnDate';
import { formatDateForGql } from '@/modules/hmis/hmisUtil';
import apolloClient from '@/providers/apolloClient';
import {
  BulkActionType,
  GetBedNightsOnDateQuery,
  useUpdateBedNightsMutation,
  GetBedNightsOnDateQueryVariables,
} from '@/types/gqlTypes';
interface Props {
  enrollmentId: string;
  bedNightDate: Date;
  editable: boolean;
  projectId: string;
}

export const onCompletedBedNightAssignment =
  (
    refetch: ObservableQuery<
      GetBedNightsOnDateQuery,
      GetBedNightsOnDateQueryVariables
    >['refetch']
  ) =>
  () => {
    // refetch bed nights for currently selected Bed Night Date, so button state updates.
    refetch().then(() => {
      // refetch bed night query, so that "Last Bed Night" column updates.
      // do after refetch so that they're not batched, because UI waits
      // for first refetch to stop loading. this one will take longer, so dont batch it.
      apolloClient.refetchQueries({
        include: ['GetProjectEnrollmentsForBedNights'],
      });
    });
  };

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
      onCompleted: onCompletedBedNightAssignment(refetch),
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