import { Box, Collapse, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import { TabDefinition } from './util';

import { CommonOrderedList } from '@/components/CommonOrderedList';
import { CommonCard } from '@/components/elements/CommonCard';
import ExpandInfoButton from '@/components/elements/ExpandInfoButton';

interface Props {
  tabs: TabDefinition[];
}

const HouseholdSummaryIntakeHelpCard: React.FC<Props> = ({ tabs }) => {
  const [hohClientId, hohEnrollmentId] = useMemo(() => {
    const tab = tabs.find(({ isHoh }) => isHoh);
    return [tab?.clientId, tab?.enrollmentId];
  }, [tabs]);
  const anyIncomplete = useMemo(
    () => !!tabs.find((t) => t.enrollmentInProgress),
    [tabs]
  );
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded((c) => !c);

  return (
    <CommonCard sx={{ my: 2 }}>
      <Stack gap={1}>
        <Typography variant='body3'>Finalize Incomplete Enrollments</Typography>
        <Typography>
          {anyIncomplete
            ? 'Use the checkboxes to select one or more intake assessments to submit.'
            : 'All enrollments are complete. To make changes to submitted assessments, edit and save them directly.'}
        </Typography>

        <ExpandInfoButton expanded={expanded} onClick={toggleExpanded}>
          More information about this process
        </ExpandInfoButton>
      </Stack>
      {hohEnrollmentId && hohClientId && (
        <Collapse in={expanded}>
          <Box sx={{ py: 1 }}>
            <Typography variant='body3'>How to Enter Household</Typography>
            <CommonOrderedList>
              <li>Perform the intake assessment for each household member.</li>
              <li>
                Use the checkboxes in the table below to select members for
                entry.
              </li>
              <li>Press the Submit Assessments button.</li>
            </CommonOrderedList>
            <Stack gap={1}>
              <Typography variant='body3'>
                Entering the Head of Household
              </Typography>
              <Typography>
                The HoH must be entered <b>before</b>, or{' '}
                <b>at the same time as</b>, all other members.
              </Typography>
              <Typography>
                The HoH's entry date should be before, or equal to, the entry
                dates for all other members.
              </Typography>
            </Stack>
          </Box>
        </Collapse>
      )}
    </CommonCard>
  );
};

export default HouseholdSummaryIntakeHelpCard;
