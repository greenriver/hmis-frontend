import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { fromPairs } from 'lodash-es';
import { useMemo, useState } from 'react';
import { generatePath, Link, useParams } from 'react-router-dom';

import AssociatedHouseholdMembers from './household/AssociatedHouseholdMembers';
import RelationshipToHohSelect from './household/RelationshipToHohSelect';
import { useRecentHouseholdMembers } from './household/useRecentHouseholdMembers';
import { useEnrollmentCrumbs } from './useEnrollmentCrumbs';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import GenericTable, { Columns } from '@/components/elements/GenericTable';
import Loading from '@/components/elements/Loading';
import { clientName, enrollmentName } from '@/modules/hmis/hmisUtil';
import ClientSearch, {
  searchResultColumns,
} from '@/modules/search/components/ClientSearch';
import apolloClient from '@/providers/apolloClient';
import { DashboardRoutes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  ClientFieldsFragmentDoc,
  RelationshipToHoH,
  useGetEnrollmentWithHoHQuery,
} from '@/types/gqlTypes';

const AddHouseholdMembers = () => {
  const { clientId, enrollmentId } = useParams() as {
    clientId: string;
    enrollmentId: string;
  };
  const [recentMembers, recentMembersLoading] =
    useRecentHouseholdMembers(clientId);

  // map client id -> realtionship-to-hoh
  const [members, setMembers] = useState<
    Record<string, RelationshipToHoH | null>
  >({});

  // map client id -> realtionship-to-hoh (clients that are alredy members)
  const [currentMembers, setCurrentMembers] = useState<
    Record<string, RelationshipToHoH>
  >({});

  const { loading: enrollmentLoading } = useGetEnrollmentWithHoHQuery({
    variables: { id: enrollmentId },
    onCompleted: (data) => {
      const hc = data?.enrollment?.household.householdClients || [];
      setCurrentMembers(
        fromPairs(hc.map((c) => [c.client.id, c.relationshipToHoH]))
      );
    },
  });

  const [crumbs, loading, enrollment] = useEnrollmentCrumbs(
    'Add Household Members'
  );

  const onRemove = useMemo(
    () => (id: string) =>
      setMembers((current) => {
        const copy = { ...current };
        delete copy[id];
        return copy;
      }),
    [setMembers]
  );

  // don't show people that are already enrolled in this household
  const eligibleMembers = useMemo(
    () => recentMembers?.filter(({ id }) => !(id in currentMembers)),
    [currentMembers, recentMembers]
  );

  // get each selected member from the cache so we can show them in the summary table
  const selectedMembersClientFragments = useMemo(() => {
    return Object.keys(members)
      .map((id) =>
        apolloClient.readFragment({
          id: `Client:${id}`,
          fragment: ClientFieldsFragmentDoc,
          fragmentName: 'ClientFields',
        })
      )
      .filter((c) => !!c);
  }, [members]);

  if (loading || enrollmentLoading) return <Loading />;
  if (!crumbs || !enrollment) throw Error('Enrollment not found');

  const columns: Columns<ClientFieldsFragment>[] = [
    ...searchResultColumns,
    {
      header: '',
      render: (client: ClientFieldsFragment) => {
        const isSelected = client.id in members;
        return (
          <Button
            variant='outlined'
            size='small'
            disabled={isSelected}
            onClick={() => {
              setMembers((current) => {
                const copy = { ...current };
                if (client.id in current) {
                  delete copy[client.id];
                } else {
                  copy[client.id] = null;
                }
                return copy;
              });
            }}
          >
            {isSelected ? 'Included' : 'Include'}
          </Button>
        );
      },
    },
  ];

  const numSelected = Object.keys(members).length;

  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
      <Grid container spacing={4} sx={{ pb: 10 }}>
        <Grid item xs={11}>
          <Typography variant='h3' sx={{ mb: 2 }}>
            <b>Add Household Members</b>
            {` to ${enrollmentName(enrollment)}`}
          </Typography>
          {recentMembersLoading && <Loading />}
          {eligibleMembers && eligibleMembers.length > 0 && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant='h5' sx={{ mb: 2 }}>
                Add Previously Associated Members
              </Typography>
              <AssociatedHouseholdMembers
                recentMembers={eligibleMembers}
                members={members}
                setMembers={setMembers}
                hideRelationshipToHoH
              />
            </Paper>
          )}

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant='h5' sx={{ mb: 2 }}>
              Search for Clients to Add to Enrollment
            </Typography>
            <ClientSearch
              hideInstructions
              cardsEnabled={false}
              wrapperComponent={Box}
              searchResultsTableProps={{
                handleRowClick: undefined,
                tableProps: { size: 'small' },
                columns,
              }}
            />
          </Paper>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant='h5' sx={{ mb: 3 }}>
              Summary
            </Typography>
            {selectedMembersClientFragments.length === 0 && (
              <Typography variant='body2'>
                No additional household members selected.
              </Typography>
            )}
            {selectedMembersClientFragments.length > 0 && (
              <GenericTable<ClientFieldsFragment>
                rows={selectedMembersClientFragments || []}
                columns={[
                  {
                    header: 'Client Name',
                    key: 'name',
                    render: (client) => clientName(client),
                  },
                  {
                    header: 'Relationship to Head of Household',
                    width: '30%',
                    key: 'relationship',
                    render: (client) => (
                      <RelationshipToHohSelect
                        value={members[client.id]}
                        onChange={(_, selected) => {
                          setMembers((current) => {
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
                    ),
                  },
                  {
                    header: '',
                    key: 'action',
                    render: (client) => (
                      <Button
                        size='small'
                        variant='outlined'
                        onClick={() => onRemove(client.id)}
                      >
                        Remove
                      </Button>
                    ),
                  },
                ]}
              />
            )}
          </Paper>
          <Stack direction={'row'} spacing={2} sx={{ mb: 3 }}>
            <Button color='secondary' disabled={numSelected === 0}>
              {numSelected > 0
                ? `Add ${numSelected} Client${
                    numSelected > 1 ? 's' : ''
                  } to Household`
                : 'Add to Household'}
            </Button>
            <Button
              color='secondary'
              variant='outlined'
              component={Link}
              to={generatePath(DashboardRoutes.VIEW_ENROLLMENT, {
                clientId,
                enrollmentId,
              })}
            >
              Cancel
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};
export default AddHouseholdMembers;
