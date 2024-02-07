import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Paper } from '@mui/material';
// import { formatISO, subWeeks } from 'date-fns';
import { generatePath, useNavigate } from 'react-router-dom';

import CommonToggle, { ToggleItem } from '@/components/elements/CommonToggle';
import LabelWithContent from '@/components/elements/LabelWithContent';
import Loading from '@/components/elements/Loading';
import {
  ClientIcon,
  EnrollmentIcon,
} from '@/components/elements/SemanticIcons';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useDebouncedState from '@/hooks/useDebouncedState';
import useSafeParams from '@/hooks/useSafeParams';
import ClientAccessSummaryTable from '@/modules/admin/components/users/ClientAccessSummaryTable';
import EnrollmentAccessSummaryTable from '@/modules/admin/components/users/EnrollmentAccessSummaryTable';
import UserAuditHistory from '@/modules/admin/components/users/UserAuditHistory';
import { useUser } from '@/modules/dataFetching/hooks/useUser';
import ClientTextSearchInput from '@/modules/search/components/ClientTextSearchInput';
import CommonSearchInput from '@/modules/search/components/CommonSearchInput';
import { AdminDashboardRoutes } from '@/routes/routes';

type UserHistoryType = 'access' | 'edits';
const historyTypeToggleItems: ToggleItem<UserHistoryType>[] = [
  {
    value: 'access',
    label: 'User Access',
    Icon: AccessTimeIcon,
  },
  {
    value: 'edits',
    label: 'User Edits',
    Icon: EditIcon,
  },
];

type AccessEntityType = 'clients' | 'enrollments';
const accessToggleItems: ToggleItem<AccessEntityType>[] = [
  {
    value: 'clients',
    label: 'Clients',
    Icon: ClientIcon,
  },
  {
    value: 'enrollments',
    label: 'Enrollments',
    Icon: EnrollmentIcon,
  },
];

interface Props {
  userHistoryType: UserHistoryType;
  accessEntityType?: AccessEntityType;
}
const UserAuditPage: React.FC<Props> = ({
  userHistoryType,
  accessEntityType,
}) => {
  const { userId } = useSafeParams() as { userId: string };
  const { user, loading } = useUser(userId);
  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');
  const navigate = useNavigate();
  //const defaultStartDate = useMemo<string>(() => {
  //  const today = new Date();
  //  const twoWeeksAgo = subWeeks(today, 2);
  //  return formatISO(twoWeeksAgo);
  //}, []);

  if (userHistoryType === 'access' && !accessEntityType) {
    throw new Error('Access entity type must be provided');
  }

  if (!user && loading) return <Loading />;
  if (!user) return <NotFound />;

  const handleHistoryTypeToggleChange = (value: UserHistoryType) => {
    switch (value) {
      case 'access':
        navigate(
          generatePath(AdminDashboardRoutes.USER_CLIENT_ACCESS_HISTORY, {
            userId,
          })
        );
        break;
      case 'edits':
        navigate(
          generatePath(AdminDashboardRoutes.USER_EDIT_HISTORY, {
            userId,
          })
        );
        break;
    }
  };

  const handleAccessToggleChange = (value: AccessEntityType) => {
    switch (value) {
      case 'clients':
        navigate(
          generatePath(AdminDashboardRoutes.USER_CLIENT_ACCESS_HISTORY, {
            userId,
          })
        );
        break;
      case 'enrollments':
        navigate(
          generatePath(AdminDashboardRoutes.USER_ENROLLMENT_ACCESS_HISTORY, {
            userId,
          })
        );
        break;
    }
  };

  return (
    <>
      <PageTitle title={`${user.name} Audit History`} />
      <LabelWithContent
        label='Audit History Type'
        labelId='page-type-label'
        renderChildren={(labelElement) => (
          <CommonToggle
            sx={{ mb: 3 }}
            value={userHistoryType}
            onChange={handleHistoryTypeToggleChange}
            items={historyTypeToggleItems}
            aria-labelledby={
              (labelElement && labelElement.getAttribute('id')) || undefined
            }
          />
        )}
      />
      <Paper>
        {userHistoryType === 'access' && (
          <>
            <Box my={2} px={2}>
              <LabelWithContent
                label='View access by'
                labelId='access-type-label'
                renderChildren={(labelElement) => (
                  <CommonToggle
                    sx={{ mb: 3 }}
                    value={accessEntityType || 'clients'}
                    onChange={handleAccessToggleChange}
                    items={accessToggleItems}
                    size='small'
                    variant='gray'
                    aria-labelledby={
                      (labelElement && labelElement.getAttribute('id')) ||
                      undefined
                    }
                  />
                )}
              />
              {accessEntityType === 'clients' && (
                <ClientTextSearchInput
                  label='Search client access'
                  value={search}
                  onChange={setSearch}
                  helperText={null}
                  searchAdornment
                />
              )}
              {accessEntityType === 'enrollments' && (
                <CommonSearchInput
                  label='Search enrollment access'
                  name='searchEnrollments'
                  placeholder='Search by name, DOB, SSN, Personal ID, MCI ID, or Enrollment ID'
                  value={search}
                  onChange={setSearch}
                  fullWidth
                  searchAdornment
                />
              )}
            </Box>
            {accessEntityType === 'clients' && (
              <ClientAccessSummaryTable
                userId={userId}
                // startDate={defaultStartDate}
                searchTerm={debouncedSearch}
              />
            )}
            {accessEntityType === 'enrollments' && (
              <EnrollmentAccessSummaryTable
                userId={userId}
                // startDate={defaultStartDate}
                searchTerm={debouncedSearch}
              />
            )}
          </>
        )}
        {userHistoryType === 'edits' && <UserAuditHistory />}
      </Paper>
    </>
  );
};

export default UserAuditPage;
