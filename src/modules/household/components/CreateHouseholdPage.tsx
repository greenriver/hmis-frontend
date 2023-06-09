import { Grid } from '@mui/material';
import { Box } from '@mui/system';

import { CommonCard } from '@/components/elements/CommonCard';
import ClientSearch, {
  SEARCH_RESULT_COLUMNS,
} from '@/modules/search/components/ClientSearch';

const CreateHouseholdPage = () => {
  // const { project } = useProjectDashboardContext();
  return (
    <Grid container spacing={4} sx={{ pb: 10 }}>
      <Grid item xs={12}>
        <CommonCard
          sx={{ my: 2, py: 4, textAlign: 'center', color: 'text.secondary' }}
        >
          No Members, Add Clients to Household
        </CommonCard>

        <CommonCard title='Client Search'>
          {/* TODO: implement action column for adding to household / creating household */}
          <ClientSearch
            hideInstructions
            hideProject
            hideAdvanced
            cardsEnabled={false}
            pageSize={10}
            wrapperComponent={Box}
            addClientInDialog
            searchResultsTableProps={{
              rowLinkTo: undefined,
              tableProps: { size: 'small' },
              columns: SEARCH_RESULT_COLUMNS,
            }}
          />
        </CommonCard>
      </Grid>
    </Grid>
  );
};
export default CreateHouseholdPage;
