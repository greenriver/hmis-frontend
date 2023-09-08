import { Collapse, Typography } from '@mui/material';
import { useMemo, useState } from 'react';

import { TabDefinition } from './util';

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
  const [expanded, setExpanded] = useState(false);
  const toggleExpanded = () => setExpanded((c) => !c);
  return (
    <CommonCard sx={{ my: 2 }}>
      <Typography sx={{ fontWeight: 800 }}>
        Only household members who are eligible for intake will have checkboxes
      </Typography>
      <Typography>Intake help text pending</Typography>
      <ExpandInfoButton expanded={expanded} onClick={toggleExpanded}>
        More Information About This Process
      </ExpandInfoButton>
      {hohEnrollmentId && hohClientId && (
        <Collapse in={expanded}>
          <Typography sx={{ mb: 3 }}>Content TBD</Typography>
        </Collapse>
      )}
    </CommonCard>
  );
};

export default HouseholdSummaryIntakeHelpCard;
