import { useCallback, useEffect, useMemo, useState } from 'react';

import AddToHouseholdButton from '../components/elements/AddToHouseholdButton';
import { isHouseholdClient, RecentHouseholdMember } from '../types';

import { clientBriefName } from '@/modules/hmis/hmisUtil';
import {
  ClientFieldsFragment,
  RelationshipToHoH,
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
  const [getHousehold, { data, loading }] = useGetHouseholdLazyQuery({
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
    const hc = data?.household?.householdClients || [];
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

  const currentHoH = useMemo(
    () =>
      (data?.household?.householdClients || []).find(
        (e) => e.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
      )?.enrollment,
    [data]
  );
  const addToEnrollmentColumns = useMemo(() => {
    const hohUnitId = currentHoH?.currentUnit?.id;

    console.log(currentHoH, hohUnitId);
    return [
      {
        header: '',
        key: 'add',
        width: '10%',
        minWidth: '180px',
        render: (record: ClientFieldsFragment | RecentHouseholdMember) => {
          const client = isHouseholdClient(record) ? record.client : record;
          return (
            <AddToHouseholdButton
              clientId={client.id}
              clientName={clientBriefName(client)}
              householdId={householdId}
              projectId={projectId}
              isMember={currentMembersMap.has(client.id)}
              onSuccess={onSuccess}
              hohUnitId={hohUnitId}
            />
          );
        },
      },
    ];
  }, [currentMembersMap, householdId, projectId, onSuccess, currentHoH]);

  return {
    addToEnrollmentColumns,
    householdId,
    household: data?.household,
    refetchHousehold,
    loading,
  };
}
