import { Button, Paper } from '@mui/material';
import { useMemo, useState } from 'react';

import TextInput from '@/components/elements/input/TextInput';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useDebouncedState from '@/hooks/useDebouncedState';
import ConfirmImpersonation from '@/modules/admin/components/ConfirmImpersonation';
import useAuth from '@/modules/auth/hooks/useAuth';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  ApplicationUserFieldsFragment,
  GetApplicationUsersDocument,
  GetApplicationUsersQuery,
  GetApplicationUsersQueryVariables,
} from '@/types/gqlTypes';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [search, setSearch, debouncedSearch] = useDebouncedState<
    string | undefined
  >(undefined);

  const [chosenUser, setChosenUser] = useState<ApplicationUserFieldsFragment>();
  const handleCancel = () => {
    setChosenUser(undefined);
  };

  const columns = useMemo<ColumnDef<ApplicationUserFieldsFragment>[]>(
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
        header: 'Email Address',
        render: ({ email }) => email,
      },
      {
        width: '100px',
        render: (user) => (
          <Button
            size='small'
            onClick={() => setChosenUser(user)}
            disabled={user.id == currentUser?.id || currentUser?.impersonating}
          >
            Impersonate
          </Button>
        ),
      },
    ],
    [currentUser]
  );

  return (
    <>
      <PageTitle title='Users' />
      {chosenUser && (
        <ConfirmImpersonation onCancel={handleCancel} user={chosenUser} />
      )}
      <Paper>
        <GenericTableWithData<
          GetApplicationUsersQuery,
          GetApplicationUsersQueryVariables,
          ApplicationUserFieldsFragment
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
          queryDocument={GetApplicationUsersDocument}
          columns={columns}
          noData='No users'
          pagePath='applicationUsers'
          defaultPageSize={25}
        />
      </Paper>
    </>
  );
};
export default AdminUsers;
