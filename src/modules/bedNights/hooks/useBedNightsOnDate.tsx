import { NetworkStatus } from '@apollo/client';
import { useMemo } from 'react';
import { formatDateForGql } from '@/modules/hmis/hmisUtil';
import { useGetBedNightsOnDateQuery } from '@/types/gqlTypes';

export function useBedNightsOnDate(projectId: string, date?: Date | null) {
  const { data, loading, error, refetch, networkStatus } =
    useGetBedNightsOnDateQuery({
      variables: {
        projectId,
        bedNightOnDate: date ? formatDateForGql(date) || '' : '',
      },
      skip: !date,
      notifyOnNetworkStatusChange: true,
    });

  const enrollmentIdsWithBedNights = useMemo(() => {
    if (!data?.project) return;

    return new Set(data.project.enrollments.nodes.map((en) => en.id));
  }, [data]);

  if (error) throw error;

  return {
    enrollmentIdsWithBedNights,
    loading,
    refetch,
    refetchLoading: loading && networkStatus === NetworkStatus.refetch,
  };
}
