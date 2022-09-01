import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import SelectHouseholdMemberTable from './SelectHouseholdMemberTable';
import { useEnrollmentCrumbs } from './useEnrollmentCrumbs';
import { useRecentHouseholdMembers } from './useRecentHouseholdMembers';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import { Columns } from '@/components/elements/GenericTable';
import Loading from '@/components/elements/Loading';
import { enrollmentName } from '@/modules/hmis/hmisUtil';
import ClientSearch, {
  searchResultColumns,
} from '@/modules/search/components/ClientSearch';
import { ClientFieldsFragment } from '@/types/gqlTypes';

const AddHouseholdMembers = () => {
  const { clientId } = useParams() as {
    clientId: string;
    enrollmentId: string;
  };
  const [recentMembers, recentMembersLoading] =
    useRecentHouseholdMembers(clientId);

  // map client id -> realtionship-to-hoh
  const [members, setMembers] = useState<Record<string, string>>({});
  const [crumbs, loading, enrollment] = useEnrollmentCrumbs(
    'Add Household Members'
  );
  if (loading) return <Loading />;
  if (!crumbs || !enrollment) throw Error('Enrollment not found');

  // TODO: filter out people that are already enrolled
  const eligibleMembers = recentMembers;

  const columns: Columns<ClientFieldsFragment>[] = [
    ...searchResultColumns,
    {
      header: '',
      render: (row: ClientFieldsFragment) => (
        <Button
          variant='outlined'
          size='small'
          onClick={() => console.log(row.id)}
        >
          Include
        </Button>
      ),
    },
  ];

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
            <Typography variant='h5' sx={{ mb: 2 }}>
              Summary
            </Typography>
          </Paper>
          <Stack direction={'row'} spacing={2} sx={{ mb: 3 }}>
            <Button color='secondary'>Add to Enrollment</Button>
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
