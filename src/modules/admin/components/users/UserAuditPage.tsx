import { Box, Paper, Typography } from '@mui/material';
// import { formatISO, subWeeks } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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
import { useUser } from '@/modules/dataFetching/hooks/useUser';
import ClientTextSearchInput from '@/modules/search/components/ClientTextSearchInput';
import CommonSearchInput from '@/modules/search/components/CommonSearchInput';
import { AdminDashboardRoutes } from '@/routes/routes';
import { generateSafePath } from '@/utils/pathEncoding';

type EntityType = 'clients' | 'enrollments';

const toggleItems: ToggleItem<EntityType>[] = [
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
  entityType: EntityType;
}
const UserAuditPage: React.FC<Props> = ({ entityType }) => {
  const { userId } = useSafeParams() as { userId: string };
  const { user, loading } = useUser(userId);
  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');
  const navigate = useNavigate();
  //const defaultStartDate = useMemo<string>(() => {
  //  const today = new Date();
  //  const twoWeeksAgo = subWeeks(today, 2);
  //  return formatISO(twoWeeksAgo);
  //}, []);

  if (!user && loading) return <Loading />;
  if (!user) return <NotFound />;

  const handleTabChange = (value: EntityType) => {
    switch (value) {
      case 'clients':
        navigate(
          generateSafePath(AdminDashboardRoutes.USER_CLIENT_ACCESS_HISTORY, {
            userId,
          })
        );
        break;
      case 'enrollments':
        navigate(
          generateSafePath(
            AdminDashboardRoutes.USER_ENROLLMENT_ACCESS_HISTORY,
            { userId }
          )
        );
        break;
    }
  };

  return (
    <>
      <PageTitle title={`Access History for ${user.name}`} />
      <Paper>
        <Box my={2} px={2}>
          <Typography variant='subtitle1' sx={{ mb: 2 }}>
            {`Data on this page may be delayed by up to an hour. Recent user activity may not be immediately visible.`}
          </Typography>
          <LabelWithContent
            label='View access by'
            labelId='access-type-label'
            renderChildren={(labelElement) => (
              <CommonToggle
                sx={{ mb: 3 }}
                value={entityType}
                onChange={handleTabChange}
                items={toggleItems}
                size='small'
                variant='gray'
                aria-labelledby={
                  (labelElement && labelElement.getAttribute('id')) || undefined
                }
              />
            )}
          />
          {entityType === 'clients' && (
            <ClientTextSearchInput
              label='Search client access'
              value={search}
              onChange={setSearch}
              helperText={null}
              searchAdornment
            />
          )}
          {entityType === 'enrollments' && (
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
        {entityType === 'clients' && (
          <ClientAccessSummaryTable
            userId={userId}
            // startDate={defaultStartDate}
            searchTerm={debouncedSearch}
          />
        )}
        {entityType === 'enrollments' && (
          <EnrollmentAccessSummaryTable
            userId={userId}
            // startDate={defaultStartDate}
            searchTerm={debouncedSearch}
          />
        )}
      </Paper>
    </>
  );
};

export default UserAuditPage;
