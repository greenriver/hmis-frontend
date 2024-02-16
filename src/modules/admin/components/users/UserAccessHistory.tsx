import { Alert, Box } from '@mui/material';
import { generatePath, useNavigate } from 'react-router-dom';
import CommonToggle, { ToggleItem } from '@/components/elements/CommonToggle';
import LabelWithContent from '@/components/elements/LabelWithContent';
import {
  ClientIcon,
  EnrollmentIcon,
} from '@/components/elements/SemanticIcons';
import useDebouncedState from '@/hooks/useDebouncedState';
import useSafeParams from '@/hooks/useSafeParams';
import ClientAccessSummaryTable from '@/modules/admin/components/users/ClientAccessSummaryTable';
import EnrollmentAccessSummaryTable from '@/modules/admin/components/users/EnrollmentAccessSummaryTable';
import ClientTextSearchInput from '@/modules/search/components/ClientTextSearchInput';
import CommonSearchInput from '@/modules/search/components/CommonSearchInput';
import { AdminDashboardRoutes } from '@/routes/routes';

export type AccessEntityType = 'clients' | 'enrollments';
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
  accessEntityType?: AccessEntityType;
}
const UserAccessHistory = ({ accessEntityType }: Props) => {
  const { userId } = useSafeParams() as { userId: string };
  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');
  const navigate = useNavigate();

  if (!accessEntityType) {
    throw new Error('Access entity type must be provided');
  }

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
      <Box my={2} px={2}>
        <Alert severity='warning' sx={{ mb: 2 }}>
          Data on this page may be delayed by up to an hour. Recent user
          activity may not be immediately visible.
        </Alert>
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
                (labelElement && labelElement.getAttribute('id')) || undefined
              }
            />
          )}
        />
        {accessEntityType === 'clients' && (
          <ClientTextSearchInput
            label='Search client access'
            value={search}
            onChange={setSearch}
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
  );
};

export default UserAccessHistory;
