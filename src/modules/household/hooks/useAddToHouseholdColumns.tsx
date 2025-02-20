import { useCallback, useEffect, useMemo } from 'react';

import AddToHouseholdButton from '../components/elements/AddToHouseholdButton';
import { isRecentHouseholdMember, RecentHouseholdMember } from '../types';

import { ColumnDef } from '@/components/elements/table/types';
import { ManageHouseholdProject } from '@/modules/household/components/ManageHousehold';
import {
  ClientSearchResultFieldsFragment,
  useGetHouseholdLazyQuery,
} from '@/types/gqlTypes';

interface Args {
  householdId?: string; // undefined if building new household and no enrollments added yet
  project: ManageHouseholdProject;
  onSuccess: (householdId: string) => void;
}

export default function useAddToHouseholdColumns({
  householdId,
  project,
  onSuccess,
}: Args) {
  const [getHousehold, { data, loading, error }] = useGetHouseholdLazyQuery({
    fetchPolicy: 'network-only',
  });

  const refetchHousehold = useCallback(() => {
    if (!householdId) return;
    getHousehold({ variables: { id: householdId } });
  }, [getHousehold, householdId]);

  // Refetch household when household ID changes
  useEffect(() => refetchHousehold(), [refetchHousehold, householdId]);

  const currentMembersMap = useMemo(() => {
    // filter out exited members, because they can be re-added
    const hc =
      data?.household?.householdClients?.filter(
        (hc) => !hc.enrollment.exitDate
      ) || [];

    return new Set(hc.map((c) => c.client.id));
  }, [data]);

  const handleSuccess = useCallback(
    (hhId: string) => {
      refetchHousehold();
      onSuccess(hhId);
    },
    [refetchHousehold, onSuccess]
  );
  // workaround to scroll to top if refetching household
  useEffect(() => {
    if (loading) window.scrollTo(0, 0);
  }, [data, loading]);

  const addToEnrollmentColumns: ColumnDef<
    ClientSearchResultFieldsFragment | RecentHouseholdMember
  >[] = useMemo(() => {
    return [
      {
        header: '',
        key: 'add',
        width: '10%',
        minWidth: '180px',
        render: (record) => {
          const client = isRecentHouseholdMember(record)
            ? record.client
            : record;
          return (
            <AddToHouseholdButton
              client={client}
              project={project}
              isMember={currentMembersMap.has(client.id)}
              onSuccess={handleSuccess}
              household={data?.household || undefined}
              // Disable button until `household` is fetched
              disabled={loading && !!householdId && !data?.household}
            />
          );
        },
      },
    ];
  }, [
    project,
    currentMembersMap,
    handleSuccess,
    data?.household,
    loading,
    householdId,
  ]);

  if (error) throw error;

  return {
    addToEnrollmentColumns,
    household: data?.household,
    refetchHousehold,
    loading,
  };
}
