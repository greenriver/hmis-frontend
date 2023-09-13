import {
  Alert,
  AlertTitle,
  Box,
  Collapse,
  Stack,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import { TabDefinition } from './util';

import { CommonOrderedList } from '@/components/CommonOrderedList';
import { CommonCard } from '@/components/elements/CommonCard';
import ExpandInfoButton from '@/components/elements/ExpandInfoButton';
import RouterLink from '@/components/elements/RouterLink';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { AssessmentRole } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

interface Props {
  tabs: TabDefinition[];
}

const HouseholdSummaryExitHelpCard: React.FC<Props> = ({ tabs }) => {
  const [hohClientId, hohEnrollmentId] = useMemo(() => {
    const tab = tabs.find(({ isHoh }) => isHoh);
    return [tab?.clientId, tab?.enrollmentId];
  }, [tabs]);
  const anyIncomplete = useMemo(
    () => !!tabs.find((t) => t.enrollmentInProgress),
    [tabs]
  );
  const anyOpen = useMemo(() => !!tabs.find((t) => !t.exitDate), [tabs]);
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded((c) => !c);
  const editHouseholdPath = generateSafePath(
    EnrollmentDashboardRoutes.EDIT_HOUSEHOLD,
    {
      clientId: hohClientId,
      enrollmentId: hohEnrollmentId,
    }
  );
  const intakePath = generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
    clientId: hohClientId,
    enrollmentId: hohEnrollmentId,
    formRole: AssessmentRole.Intake,
  });

  return (
    <>
      {/* If any members are WIP, you can't exit */}
      {anyIncomplete && (
        <Alert severity='error' variant='outlined'>
          <AlertTitle>Unable to Exit Clients</AlertTitle>
          <Typography>
            Some household members have incomplete enrollments. Please finish
            all{' '}
            <RouterLink to={intakePath} variant='body1'>
              intake assessments
            </RouterLink>{' '}
            before proceeding, or delete the incomplete enrollments.
          </Typography>
        </Alert>
      )}
      <CommonCard sx={{ my: 2 }}>
        <Stack gap={1}>
          <Typography variant='body3'>Exit Household Members</Typography>
          <Typography>
            {anyOpen
              ? 'Use the checkboxes to select one or more household members to exit.'
              : 'All members are exited. To make changes to submitted assessments, edit and save them directly.'}
          </Typography>

          {/* <Typography>
            The Head of Household cannot be exited before other members.
          </Typography> */}
          <ExpandInfoButton expanded={expanded} onClick={toggleExpanded}>
            More information about this process
          </ExpandInfoButton>
        </Stack>
        {hohEnrollmentId && hohClientId && (
          <Collapse in={expanded}>
            <Box sx={{ py: 1 }}>
              <Typography variant='body3'>
                How to Exit Household Members
              </Typography>
              <CommonOrderedList>
                <li>
                  Complete the exit assessment for each household member that is
                  exiting the project.
                </li>
                <li>
                  Use the checkboxes in the table below to select members for
                  exit.
                </li>
                <li>Press the Submit Assessments button.</li>
              </CommonOrderedList>
              <Stack gap={1}>
                <Typography variant='body3'>
                  Exiting the Head of Household
                </Typography>
                <Typography>
                  The HoH must be exited after, or at the same time as, all
                  other members.
                </Typography>
                <Typography>
                  The HoH's exit date should be after, or equal to, the exit
                  dates for all other members.
                </Typography>
                <Typography>
                  If you need to exit the current HoH, but other members should
                  remain enrolled, then you need to{' '}
                  <RouterLink to={editHouseholdPath} variant='body1'>
                    change the Head of Household
                  </RouterLink>{' '}
                  before proceeding.
                </Typography>
              </Stack>
            </Box>
          </Collapse>
        )}
      </CommonCard>
    </>
  );
};

export default HouseholdSummaryExitHelpCard;
