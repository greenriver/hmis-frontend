import { Divider, Typography } from '@mui/material';
import React from 'react';
import {
  CommonDetailGridContainer,
  CommonDetailGridItem,
} from '@/components/elements/CommonDetailGrid';
import { HmisEnums } from '@/types/gqlEnums';
import { CeMatchRuleFieldsFragment, CeMatchRuleOwner } from '@/types/gqlTypes';

interface Props {
  title: string;
  rules: CeMatchRuleFieldsFragment[];
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
            {rule.ownerType === CeMatchRuleOwner.Unit
              ? 'Applies to this Unit'
              : `Inherited from ${HmisEnums.CeMatchRuleOwner[rule.ownerType]}`}
          </CommonDetailGridItem>
        ))}
      </CommonDetailGridContainer>
      <Divider />
    </>
  );
};

export default MatchRuleGrid;
