import {
  Alert,
  AlertTitle,
  Box,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import ButtonLink from '@/components/elements/ButtonLink';
import GenericTable from '@/components/elements/table/GenericTable';
import { PROJECT_HOUSEHOLD_COLUMNS } from '@/modules/projects/components/tables/ProjectHouseholdsTable';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  HouseholdClientFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface Props {
  donorHousehold: HouseholdFieldsFragment;
  selectedClients: HouseholdClientFieldsFragment[];
  setSelectedClients: Dispatch<SetStateAction<HouseholdClientFieldsFragment[]>>;
  // todo @martha - need receivingHouseholdHohName
}

const JoinHouseholdSelectClients = ({
  donorHousehold,
  selectedClients,
  setSelectedClients,
}: Props) => {
  const selectedClientIds = useMemo(
    () => selectedClients.map((hc) => hc.id),
    [selectedClients]
  );

  // todo @martha - add some comments here
  const hoh = useMemo(
    () =>
      donorHousehold.householdClients.find(
        (hc) => hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
      ) as HouseholdClientFieldsFragment,
    [donorHousehold.householdClients]
  );

  const setSelectedClientIds = useCallback(
    (clientIds: readonly string[]) => {
      if (hoh && clientIds.includes(hoh.id)) {
        setSelectedClients(donorHousehold.householdClients);
      } else {
        setSelectedClients(
          donorHousehold.householdClients.filter((hc) =>
            clientIds.includes(hc.id)
          )
        );
      }
    },
    [donorHousehold.householdClients, hoh, setSelectedClients]
  );

  return (
    <Stack gap={2}>
      <Box>
        <Typography variant='overline'>Step 1</Typography>
        <Typography variant='h3'>Select Clients</Typography>
        {/*  todo @martha - should it really be an h3?*/}
      </Box>
      <Typography variant='body1'>
        Select which clients you would like to join to [HoH]’s enrollment.
      </Typography>
      {/*todo @martha - this (above) refers to the NEW hoh*/}
      {hoh &&
        selectedClientIds.includes(hoh.id) &&
        donorHousehold.householdSize > 1 && (
          <Alert
            color='info'
            action={
              <ButtonLink
                variant='contained'
                color='grayscale'
                to={generatePath(EnrollmentDashboardRoutes.EDIT_HOUSEHOLD, {
                  clientId: hoh.client.id,
                  enrollmentId: hoh.enrollment.id,
                })}
              >
                Edit Household
              </ButtonLink>
            }
          >
            <AlertTitle>Head of Household Selected</AlertTitle>
            All members must accompany the Head of Household. Select a different
            Head of Household if this is not your intention.
          </Alert>
        )}
      {/* todo @martha - could be nice to disable unselection on the other members, and add a tooltip*/}
      <Paper>
        {/*todo @martha - put these in the expected order*/}
        <GenericTable<HouseholdClientFieldsFragment>
          rows={donorHousehold.householdClients}
          // todo @martha - remove exit date? (the enrollment is, probably, unexited? or it could be exited...)
          columns={PROJECT_HOUSEHOLD_COLUMNS}
          selectable={'checkbox'}
          selected={selectedClientIds}
          onChangeSelectedRowIds={setSelectedClientIds}
        />
      </Paper>
    </Stack>
  );
};

export default JoinHouseholdSelectClients;
