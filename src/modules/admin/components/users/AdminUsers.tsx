import { Paper, Stack } from '@mui/material';
import { useMemo, useState } from 'react';

import UserActionsMenu from './UserActionsMenu';
import CommonSearchInput from '@/components/elements/CommonSearchInput';
import Loading from '@/components/elements/Loading';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import useDebouncedState from '@/hooks/useDebouncedState';
import ConfirmImpersonation from '@/modules/admin/components/ConfirmImpersonation';
import useAuth from '@/modules/auth/hooks/useAuth';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import {
  GetApplicationUsersDocument,
  GetApplicationUsersQuery,
  GetApplicationUsersQueryVariables,
  UserFieldsFragment,
} from '@/types/gqlTypes';

const AdminUsers = () => {
  const [access] = useRootPermissions();
  const { user: currentUser } = useAuth();
  const [search, setSearch, debouncedSearch] = useDebouncedState<
    string | undefined
  >(undefined);

  const [chosenUser, setChosenUser] = useState<UserFieldsFragment>();
  const handleCancel = () => {
    setChosenUser(undefined);
  };

  const columns = useMemo<ColumnDef<UserFieldsFragment>[]>(
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
        render: (user) =>
          access && (
            <UserActionsMenu
              onClickImpersonate={() => setChosenUser(user)}
              userId={user.id}
              isCurrentUser={
                !!(user.id == currentUser?.id || currentUser?.impersonating)
              }
              rootAccess={access}
            />
          ),
      },
    ],
    [access, currentUser?.id, currentUser?.impersonating]
  );

  if (!access) return <Loading />;

  return (
    <>
      <PageTitle title='Users' />
      {chosenUser && (
        <ConfirmImpersonation onCancel={handleCancel} user={chosenUser} />
      )}
      <Stack spacing={2}>
        <CommonSearchInput
          label='Search Users'
          name='search users'
          placeholder='Search by name or email'
          value={search}
          onChange={setSearch}
          fullWidth
          size='medium'
        />
        <Paper>
          <GenericTableWithData<
            GetApplicationUsersQuery,
            GetApplicationUsersQueryVariables,
            UserFieldsFragment
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
