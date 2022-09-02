import { Stack, Typography } from '@mui/material';

import AssociatedHouseholdMembers from './AssociatedHouseholdMembers';
import { useRecentHouseholdMembers } from './useRecentHouseholdMembers';

import Loading from '@/components/elements/Loading';
import { RelationshipToHoH } from '@/types/gqlTypes';

// import MiniClientSearch from '@/modules/search/components/MiniClientSearch';

/**
 * Quickly add household members to a new enrollment
 */
const QuickAddHouseholdMembers = ({
  clientId,
  members,
  setMembers,
}: {
  clientId: string;
  members: Record<string, RelationshipToHoH | null>;
  setMembers: React.Dispatch<
    React.SetStateAction<Record<string, RelationshipToHoH | null>>
  >;
}) => {
  const [recentMembers, loading] = useRecentHouseholdMembers(clientId);
  if (loading) return <Loading />;
  return (
    <Stack spacing={3}>
      {/* <MiniClientSearch onSubmit={(s) => console.log(s)} /> */}
      {/* <Typography>Previously Associated Members</Typography> */}
      {recentMembers && (
        <>
          <Typography>Previously Associated Members</Typography>
          <AssociatedHouseholdMembers
            recentMembers={recentMembers}
            members={members}
            setMembers={setMembers}
          />
        </>
      )}
    </Stack>
  );
};
export default QuickAddHouseholdMembers;
