import { Stack, Typography } from '@mui/material';

import SelectHouseholdMemberTable from './SelectHouseholdMemberTable';
import { useRecentHouseholdMembers } from './useRecentHouseholdMembers';

import Loading from '@/components/elements/Loading';

// import MiniClientSearch from '@/modules/search/components/MiniClientSearch';

const QuickAddHouseholdMembers = ({
  clientId,
  members,
  setMembers,
}: {
  clientId: string;
  members: Record<string, string>;
  setMembers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
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
          <SelectHouseholdMemberTable
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
