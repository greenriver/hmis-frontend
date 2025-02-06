import {
  Alert,
  AlertTitle,
  Box,
  Button,
  List,
  ListItem,
  Stack,
} from '@mui/material';
import { useMemo } from 'react';
import { generatePath } from 'react-router-dom';
import ButtonLink from '@/components/elements/ButtonLink';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { clientBriefName } from '@/modules/hmis/hmisUtil';
import { ManageHouseholdProject } from '@/modules/household/components/ManageHousehold';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  ClientSearchResultFieldsFragment,
  HouseholdFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

interface Props {
  project: ManageHouseholdProject;
  joiningClient: ClientSearchResultFieldsFragment;
  conflictingEnrollmentId: string;
  receivingHousehold: HouseholdFieldsFragment;
  onClickJoinEnrollment: VoidFunction;
}

const ConflictingEnrollmentAlert = ({
  project,
  joiningClient,
  receivingHousehold,
  conflictingEnrollmentId,
  onClickJoinEnrollment,
}: Props) => {
  const canSplitHouseholds = project.access.canSplitHouseholds;

  const joiningClientName = clientBriefName(joiningClient);

  const hohName = useMemo(() => {
    const hoh = receivingHousehold.householdClients.find(
      (hc) => hc.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
    );
    if (!hoh) return '';
    return clientBriefName(hoh.client);
  }, [receivingHousehold.householdClients]);

  return (
    <Alert severity='warning'>
      <AlertTitle>Conflicting Enrollment</AlertTitle>
      <Stack direction='column' gap={1}>
        <Box>
          {joiningClientName} has a conflicting enrollment in this project that
          overlaps with the selected entry date.{' '}
          {canSplitHouseholds && (
            <>
              You have two options:
              <List sx={{ listStyle: 'decimal', pl: 4 }} component='ol'>
                <ListItem sx={{ display: 'list-item' }}>
                  The conflicting enrollment can be joined with {hohName}’s
                  household.
                </ListItem>
                <ListItem sx={{ display: 'list-item' }}>
                  To retain the conflicting enrollment, update the entry and/or
                  exit dates to not overlap with this new entry date before
                  attempting again to enroll.
                </ListItem>
              </List>
            </>
          )}
        </Box>
        <Stack direction='row' gap={2}>
          {canSplitHouseholds ? (
            <Button color='warning' onClick={onClickJoinEnrollment}>
              Join Enrollments
            </Button>
          ) : (
            <ButtonTooltipContainer
              title={
                "You don't have permission to join enrollments. Request permission from your HMIS administrator."
              }
            >
              <Button disabled color='warning'>
                Join Enrollments
              </Button>
            </ButtonTooltipContainer>
          )}
          <ButtonLink
            to={generatePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
              clientId: joiningClient.id,
              enrollmentId: conflictingEnrollmentId,
            })}
            variant='contained'
            color='grayscale'
          >
            View Conflicting Enrollment
          </ButtonLink>
        </Stack>
      </Stack>
    </Alert>
  );
};

export default ConflictingEnrollmentAlert;
