import React from 'react';
import { CommonUnstyledList } from '@/components/CommonUnstyledList';
import { CeMatchRuleFieldsFragment } from '@/types/gqlTypes';

interface Props {
  rules: CeMatchRuleFieldsFragment[];
}
const MatchRuleDisplay: React.FC<Props> = ({ rules }) => {
  return (
    <CommonUnstyledList>
      {rules.map((rule) => (
        <li key={rule.id}>{rule.name}</li>
      ))}
    </CommonUnstyledList>
  );
};

export default MatchRuleDisplay;
