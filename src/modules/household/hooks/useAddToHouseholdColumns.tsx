import { useCallback, useEffect, useMemo, useState } from 'react';

import AddToHouseholdButton from '../components/elements/AddToHouseholdButton';
import { isRecentHouseholdMember, RecentHouseholdMember } from '../types';

import {
  ClientFieldsFragment,
  useGetHouseholdLazyQuery,
} from '@/types/gqlTypes';

interface Args {
  householdId?: string;
  projectId: string;
}

export default function useAddToHouseholdColumns({
  householdId: initialHouseholdId,
  projectId,
}: Args) {
  const [householdId, setHouseholdId] = useState(initialHouseholdId);
  const [getHousehold, { data, loading, error }] = useGetHouseholdLazyQuery({
    fetchPolicy: 'network-only',
  });

  const refetchHousehold = useCallback(() => {
    if (!householdId) return;
    getHousehold({ variables: { id: householdId } });
  }, [getHousehold, householdId]);

  // Refetch household when household ID changes
  useEffect(() => refetchHousehold(), [refetchHousehold, householdId]);

  // If household ID wasn't found, clear the household ID state.
  // This happens when the last/only member is removed.
  useEffect(() => {
    if (data && !data.household) setHouseholdId(undefined);
  }, [data]);

  const currentMembersMap = useMemo(() => {
    // filter out exited members, because they can be re-added
    const hc =
      data?.household?.householdClients?.filter(
        (hc) => !hc.enrollment.exitDate
      ) || [];

    return new Set(hc.map((c) => c.client.id));
  }, [data]);

  // workaround to scroll to top if refetching household
  useEffect(() => {
    if (loading) window.scrollTo(0, 0);
  }, [data, loading]);

  const onSuccess = useCallback(
    (updatedHouseholdId: string) => {
      setHouseholdId(updatedHouseholdId);
      getHousehold({ variables: { id: updatedHouseholdId } });
    },
    [getHousehold]
  );

  const addToEnrollmentColumns = useMemo(() => {
    return [
      {
        header: '',
        key: 'add',
        width: '10%',
        minWidth: '180px',
        render: (record: ClientFieldsFragment | RecentHouseholdMember) => {
          const client = isRecentHouseholdMember(record)
            ? record.client
            : record;
          return (
            <AddToHouseholdButton
              client={client}
              householdId={householdId}
              projectId={projectId}
              isMember={currentMembersMap.has(client.id)}
              onSuccess={onSuccess}
            />
          );
        },
      },
    ];
  }, [currentMembersMap, householdId, projectId, onSuccess]);

  if (error) throw error;

  return {
    addToEnrollmentColumns,
    householdId,
    onHouseholdIdChange: onSuccess,
    household: data?.household,
    refetchHousehold,
    loading,
  };
}
