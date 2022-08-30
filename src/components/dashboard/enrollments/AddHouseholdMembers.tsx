import MiniClientSearch from '@/modules/search/components/MiniClientSearch';

const AddHouseholdMembers = () => {
  return (
    <>
      {/* <Typography>Search for a Client</Typography> */}
      <MiniClientSearch onSubmit={(s) => console.log(s)} />
      {/* <Typography>Previously Associated Members</Typography> */}
    </>
  );
};
export default AddHouseholdMembers;
