import { Button, Paper } from '@mui/material';
import { useMemo, useState } from 'react';

import TextInput from '@/components/elements/input/TextInput';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useDebouncedState from '@/hooks/useDebouncedState';
import ConfirmImpersonation from '@/modules/admin/components/ConfirmImpersonation';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  GetUsersDocument,
  GetUsersQuery,
  GetUsersQueryVariables,
  UserFieldsForAdminFragment,
} from '@/types/gqlTypes';

const AdminUsers = () => {
  const [search, setSearch, debouncedSearch] = useDebouncedState<
    string | undefined
  >(undefined);

  const [chosenUser, setChosenUser] = useState<UserFieldsForAdminFragment>();
  const handleCancel = () => {
    setChosenUser(undefined);
  };

  const columns = useMemo<ColumnDef<UserFieldsForAdminFragment>[]>(
    () => [
      {
        header: 'User ID',
        width: '100px',
        render: ({ id }) => id,
      },
      {
        header: 'Name',
        render: ({ name }) => name,
      },
      {
        width: '100px',
        render: (user) => (
          <Button
            size='small'
            onClick={() => setChosenUser(user)}
            disabled={!user.hmisId}
          >
            Impersonate
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <>
      <PageTitle title='Users' />
      {chosenUser && (
        <ConfirmImpersonation onCancel={handleCancel} user={chosenUser} />
      )}
      <Paper>
        <GenericTableWithData<
          GetUsersQuery,
          GetUsersQueryVariables,
          UserFieldsForAdminFragment
        >
          header={
            <TextInput
              label='Search Users'
              name='search projects'
              placeholder='Name or email'
              value={search || ''}
              onChange={(e) => setSearch(e.target.value)}
              inputWidth='300px'
            />
          }
          queryVariables={{
            filters: { searchTerm: debouncedSearch },
          }}
          queryDocument={GetUsersDocument}
          columns={columns}
          noData='No users'
          pagePath='users'
          defaultPageSize={25}
        />
      </Paper>
    </>
  );
};
export default AdminUsers;
