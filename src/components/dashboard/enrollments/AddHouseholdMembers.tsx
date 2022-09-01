import { Stack } from '@mui/material';

import SelectHouseholdMemberTable from './SelectHouseholdMemberTable';

// import MiniClientSearch from '@/modules/search/components/MiniClientSearch';

const AddHouseholdMembers = ({
  clientId,
  members,
  setMembers,
}: {
  clientId: string;
  members: Record<string, string>;
  setMembers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) => {
  return (
    <Stack spacing={3}>
      {/* <MiniClientSearch onSubmit={(s) => console.log(s)} /> */}
      {/* <Typography>Previously Associated Members</Typography> */}
      <SelectHouseholdMemberTable
        clientId={clientId}
        members={members}
        setMembers={setMembers}
      />
    </Stack>
  );
};
export default AddHouseholdMembers;
