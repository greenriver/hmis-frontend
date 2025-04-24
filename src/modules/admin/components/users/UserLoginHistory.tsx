import DateWithRelativeTooltip from '@/components/elements/DateWithRelativeTooltip';
import { ColumnDef } from '@/components/elements/table/types';
import useSafeParams from '@/hooks/useSafeParams';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
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

    render: ({ loginTime }) => (
      <DateWithRelativeTooltip dateString={loginTime} />
    ),
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

const UserLoginHistory = () => {
  const { userId } = useSafeParams() as { userId: string };

  return (
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
  );
};

export default UserLoginHistory;
