import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import SelectHouseholdMemberTable from './SelectHouseholdMemberTable';
import { useEnrollmentCrumbs } from './useEnrollmentCrumbs';
import { useRecentHouseholdMembers } from './useRecentHouseholdMembers';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import { Columns } from '@/components/elements/GenericTable';
import Loading from '@/components/elements/Loading';
import { clientName, enrollmentName } from '@/modules/hmis/hmisUtil';
import ClientSearch, {
  searchResultColumns,
} from '@/modules/search/components/ClientSearch';
import apolloClient from '@/providers/apolloClient';
import { RelationshipToHoHEnum } from '@/types/gqlEnums';
import {
  ClientFieldsFragment,
  ClientFieldsFragmentDoc,
  RelationshipToHoH,
} from '@/types/gqlTypes';

const SelectedMember = ({
  id,
  relationshipToHoH,
  onRemove,
}: {
  id: string;
  relationshipToHoH: RelationshipToHoH | null;
  onRemove: (id: string) => void;
}) => {
  const client = apolloClient.readFragment({
    id: `Client:${id}`,
    fragment: ClientFieldsFragmentDoc,
    fragmentName: 'ClientFields',
  });
  // Should never be missing. Fetch if missing?
  if (!client) return null;

  return (
    <Grid container spacing={3}>
      <Grid item xs={3}>
        {clientName(client)}
      </Grid>
      <Grid item xs>
        <Typography>
          {relationshipToHoH ? RelationshipToHoHEnum[relationshipToHoH] : ''}
        </Typography>
      </Grid>
      <Grid item xs={1}>
        <Button size='small' variant='outlined' onClick={() => onRemove(id)}>
          Remove
        </Button>
      </Grid>
    </Grid>
  );
};

const AddHouseholdMembers = () => {
  const { clientId } = useParams() as {
    clientId: string;
    enrollmentId: string;
  };
  const [recentMembers, recentMembersLoading] =
    useRecentHouseholdMembers(clientId);

  // map client id -> realtionship-to-hoh
  const [members, setMembers] = useState<
    Record<string, RelationshipToHoH | null>
  >({});
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

  if (loading) return <Loading />;
  if (!crumbs || !enrollment) throw Error('Enrollment not found');

  // TODO: filter out people that are already enrolled
  const eligibleMembers = recentMembers;

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
              <SelectHouseholdMemberTable
                recentMembers={eligibleMembers}
                members={members}
                setMembers={setMembers}
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
            {numSelected === 0 && 'None selected'}
            {Object.entries(members).map(([id, relation], idx) => (
              <Box
                key={id}
                sx={{
                  mb: 1,
                  ml: 0,
                  width: 'unset',
                  pb: 1,
                  borderBottom:
                    idx === numSelected - 1 ? undefined : '1px solid #eee',
                }}
              >
                <SelectedMember
                  id={id}
                  relationshipToHoH={relation}
                  onRemove={onRemove}
                />
              </Box>
            ))}
          </Paper>
          <Stack direction={'row'} spacing={2} sx={{ mb: 3 }}>
            <Button color='secondary' disabled={numSelected === 0}>
              {numSelected > 0
                ? `Add ${numSelected} Client${
                    numSelected > 1 ? 's' : ''
                  } to Household`
                : 'Add to Household'}
            </Button>
            <Button color='secondary' variant='outlined'>
              Cancel
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};
export default AddHouseholdMembers;
