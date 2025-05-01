import { Divider, Typography } from '@mui/material';
import React from 'react';
import {
  CommonDetailGridContainer,
  CommonDetailGridItem,
} from '@/components/elements/CommonDetailGrid';
import { CeMatchRule } from '@/types/gqlTypes';

interface Props {
  title: string;
  rules: CeMatchRule[];
}
const MatchRuleGrid: React.FC<Props> = ({ title, rules }) => {
  return (
    <>
      <Typography variant='h5' component='h3' mb={2}>
        {title}
      </Typography>
      <CommonDetailGridContainer>
        {rules.map((rule) => (
          <CommonDetailGridItem key={rule.id} label={rule.name}>
            {rule.ownerType === 'Opportunity'
              ? 'Applies to this Opportunity'
              : `Inherited from ${rule.ownerType}`}
          </CommonDetailGridItem>
        ))}
      </CommonDetailGridContainer>
      <Divider />
    </>
  );
};

export default MatchRuleGrid;
