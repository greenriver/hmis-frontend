import { Typography } from '@mui/material';

import { HmisEnums } from '@/types/gqlEnums';
import { CeMatchRuleOwnerType } from '@/types/gqlTypes';

interface Props {
  ownerType: CeMatchRuleOwnerType;
  ownerName?: string;
  ruleId?: string;
}

const CeMatchRuleOwnerText: React.FC<Props> = ({
  ownerType,
  ownerName,
  ruleId,
}) => {
  return (
    <Typography variant='body2'>
      This eligibility rule {ruleId ? 'applies' : 'will apply'} to all units
      {ownerType !== CeMatchRuleOwnerType.DataSource && (
        <>
          {' '}
          in the {ownerName} {HmisEnums.CeMatchRuleOwnerType[ownerType]}
        </>
      )}
      .
    </Typography>
  );
};

export default CeMatchRuleOwnerText;
