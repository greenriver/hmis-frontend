import { Collapse, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import { TabDefinition } from './util';

import { CommonOrderedList } from '@/components/CommonOrderedList';
import { CommonCard } from '@/components/elements/CommonCard';
import ExpandInfoButton from '@/components/elements/ExpandInfoButton';
import RouterLink from '@/components/elements/RouterLink';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import generateSafePath from '@/utils/generateSafePath';

interface Props {
  tabs: TabDefinition[];
}

const HouseholdSummaryExitHelpCard: React.FC<Props> = ({ tabs }) => {
  const [hohClientId, hohEnrollmentId] = useMemo(() => {
    const tab = tabs.find(({ isHoh }) => isHoh);
    return [tab?.clientId, tab?.enrollmentId];
  }, [tabs]);
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded((c) => !c);
  return (
    <CommonCard sx={{ my: 2 }}>
      <Typography sx={{ fontWeight: 800 }}>
        Only household members who are eligible for exit will have checkboxes
      </Typography>
      <Typography>
        The Head of Household cannot be exited before the other members
      </Typography>
      <ExpandInfoButton expanded={expanded} onClick={toggleExpanded}>
        More Information About This Process
      </ExpandInfoButton>
      {hohEnrollmentId && hohClientId && (
        <Collapse in={expanded}>
          <Typography sx={{ fontWeight: 800 }}>
            How to Exit Household
          </Typography>
          <CommonOrderedList>
            <li>
              Complete the exit assessment for each household member. Until the
              assessment is complete the household member cannot be selected
            </li>
            <li>
              Use the checkboxes in the table below to select members for exit
            </li>
            <li>Press the Submit Assessments button</li>
          </CommonOrderedList>
          <Typography sx={{ fontWeight: 800 }}>
            Exiting the Head of Household
          </Typography>
          <Typography>
            {
              'The head of household cannot be exited before other members. In order to exit the HoH, you must either exit all members or '
            }
            <RouterLink
              to={generateSafePath(EnrollmentDashboardRoutes.EDIT_HOUSEHOLD, {
                clientId: hohClientId,
                enrollmentId: hohEnrollmentId,
              })}
              variant='body1'
            >
              change the Head of Household.
            </RouterLink>
            .
          </Typography>
        </Collapse>
      )}
    </CommonCard>
  );
};

export default HouseholdSummaryExitHelpCard;
