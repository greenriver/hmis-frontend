import { Box, Paper, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';
import GenericTable from '@/components/elements/table/GenericTable';
import { MANAGE_HOUSEHOLD_COLUMNS } from '@/modules/household/components/householdActions/SelectClientsStep';
import { HouseholdClientFieldsFragment } from '@/types/gqlTypes';

type ReviewableHousehold = {
  title: string;
  description: string;
  members: HouseholdClientFieldsFragment[];
};

interface Props {
  reviewableHouseholds: ReviewableHousehold[];
  children?: ReactNode;
}

const ReviewHouseholdsStep = ({ reviewableHouseholds, children }: Props) => {
  return (
    <Stack gap={2}>
      <Box>
        <Typography variant='overline'>Step 3</Typography>
        <Typography variant='h3'>Review Join</Typography>
      </Box>
      {children}
      {reviewableHouseholds.map((household) => {
        return (
          <>
            <Typography variant='h4'>{household.title}</Typography>
            <Typography variant='body2'>{household.description}</Typography>
            <Paper>
              <GenericTable<HouseholdClientFieldsFragment>
                rows={household.members}
                columns={MANAGE_HOUSEHOLD_COLUMNS}
                tableProps={{ 'aria-label': household.title }}
              />
            </Paper>
          </>
        );
      })}
    </Stack>
  );
};

export default ReviewHouseholdsStep;
