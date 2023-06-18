import { NetworkStatus } from '@apollo/client';
import { useCallback, useMemo, useState } from 'react';

import AddToHouseholdButton from '../components/AddToHouseholdButton';
import RelationshipToHohSelect from '../components/RelationshipToHohSelect';
import { isHouseholdClient, RecentHouseholdMember } from '../types';

import DatePicker from '@/components/elements/input/DatePicker';
import {
  ClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
  useGetHouseholdQuery,
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

  // map candidate client id -> relationship-to-hoh
  const [candidateRelationships, setCandidateRelationships] = useState<
    Record<string, RelationshipToHoH | null>
  >({});

  // map candidate client id -> entry date
  const [candidateEntryDates, setCandidateEntryDates] = useState<
    Record<string, Date | null>
  >({});

  // TODO: replace with lookup by  household id.
  // the point is to get all the Client IDs of members.
  const { data, loading, refetch, networkStatus } = useGetHouseholdQuery({
    variables: { id: householdId || '' },
    notifyOnNetworkStatusChange: true,
    skip: !householdId,
  });

  const householdLoading =
    loading && !data && networkStatus !== NetworkStatus.refetch;
  const refetchLoading = loading && networkStatus === NetworkStatus.refetch;

  const currentMembersMap = useMemo(() => {
    const hc = data?.household?.householdClients || [];
    return new Set(hc.map((c) => c.client.id));
  }, [data]);

  const onSuccess = useCallback(
    (updatedHousehold: HouseholdFieldsFragment) => {
      setHouseholdId(updatedHousehold.id);
      refetch();
    },
    [refetch]
  );

  const addToEnrollmentColumns = useMemo(() => {
    return [
      {
        header: 'Relationship to HoH',
        key: 'relationship',
        width: '20%',
        render: (record: ClientFieldsFragment | RecentHouseholdMember) => {
          const client = isHouseholdClient(record) ? record.client : record;
          if (currentMembersMap.has(client.id)) return null; // FIXME return actual value
          const value = householdId
            ? candidateRelationships[client.id] || null
            : RelationshipToHoH.SelfHeadOfHousehold;

          return (
            <RelationshipToHohSelect
              disabled={currentMembersMap.has(client.id)}
              value={value}
              onChange={(_, selected) => {
                setCandidateRelationships((current) => {
                  const copy = { ...current };
                  if (!selected) {
                    copy[client.id] = null;
                  } else {
                    copy[client.id] = selected.value;
                  }
                  return copy;
                });
              }}
            />
          );
        },
      },
      {
        header: 'Entry Date',
        key: 'entry',
        width: '1%',
        render: (record: ClientFieldsFragment | RecentHouseholdMember) => {
          const client = isHouseholdClient(record) ? record.client : record;
          if (currentMembersMap.has(client.id)) return null; // FIXME return actual value
          return (
            <DatePicker
              disabled={currentMembersMap.has(client.id)}
              value={candidateEntryDates[client.id] || null}
              disableFuture
              sx={{ width: 150 }}
              onChange={(value) => {
                setCandidateEntryDates((current) => {
                  const copy = { ...current };
                  if (!value) {
                    copy[client.id] = null;
                  } else {
                    copy[client.id] = value;
                  }
                  return copy;
                });
              }}
            />
          );
        },
      },
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
              householdId={householdId}
              projectId={projectId}
              isMember={currentMembersMap.has(client.id)}
              onSuccess={onSuccess}
              startDate={candidateEntryDates[client.id]}
              relationshipToHoH={candidateRelationships[client.id]}
            />
          );
        },
      },
    ];
  }, [
    candidateEntryDates,
    candidateRelationships,
    currentMembersMap,
    householdId,
    projectId,
    onSuccess,
  ]);

  return {
    addToEnrollmentColumns,
    householdId,
    household: data?.household,
    refetchHousehold: refetch,
    refetchLoading,
    householdLoading,
  };
}
