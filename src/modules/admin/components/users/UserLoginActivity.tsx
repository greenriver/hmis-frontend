import { ContextualCollapsibleListsProvider } from '@/components/elements/CollapsibleListContext';
import { ColumnDef } from '@/components/elements/table/types';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDateTime } from '@/modules/hmis/hmisUtil';
import {
  GetUserLoginActivitiesDocument,
  GetUserLoginActivitiesQuery,
  GetUserLoginActivitiesQueryVariables,
} from '@/types/gqlTypes';

type LoginActivityType = NonNullable<
  NonNullable<GetUserLoginActivitiesQuery['user']>['loginActivities']
>['nodes'][0];

const columns: ColumnDef<LoginActivityType>[] = [
  {
    header: 'Login Time',
    key: 'loginTime',
    // can update to use RelativeDateDisplay, fix preciseTime thing
    render: ({ loginTime }) => parseAndFormatDateTime(loginTime),
  },
  {
    header: 'IP Address',
    key: 'ip',
    render: 'ipAddress',
  },
  {
    header: 'Location',
    key: 'location',
    render: 'locationDescription',
  },
];

const UserLoginActivity = () => {
  const { userId } = useSafeParams() as { userId: string };

  return (
    <>
      <ContextualCollapsibleListsProvider>
        <GenericTableWithData<
          GetUserLoginActivitiesQuery,
          GetUserLoginActivitiesQueryVariables,
          LoginActivityType
        >
          columns={columns}
          fetchPolicy='cache-and-network'
          noData='No logins'
          pagePath='user.loginActivities'
          paginationItemName='login'
          queryDocument={GetUserLoginActivitiesDocument}
          queryVariables={{ id: userId }}
          showTopToolbar
        />
      </ContextualCollapsibleListsProvider>
    </>
  );
};

export default UserLoginActivity;
