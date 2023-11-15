import { Paper, Stack } from '@mui/material';
import { useMemo, useState } from 'react';

import UserActionsMenu from './UserActionsMenu';
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
        header: 'Name',
        render: ({ name }) => name,
      },
      {
        header: 'Email Address',
        render: ({ email }) => email,
      },
      {
        textAlign: 'right',
        render: (user) => (
          <UserActionsMenu
            onClickImpersonate={() => setChosenUser(user)}
            isCurrentUser={
              !!(user.id == currentUser?.id || currentUser?.impersonating)
            }
          />
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
      <Stack spacing={2}>
        <TextInput
          label='Search Users'
          name='search users'
          placeholder='Search by name or email'
          value={search || ''}
          onChange={(e) => setSearch(e.target.value)}
          inputWidth='400px'
        />

        <Paper>
          <GenericTableWithData<
            GetApplicationUsersQuery,
            GetApplicationUsersQueryVariables,
            ApplicationUserFieldsFragment
          >
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
      </Stack>
    </>
  );
};
export default AdminUsers;
