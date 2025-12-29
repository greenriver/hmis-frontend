import { Stack, Tooltip, Typography } from '@mui/material';
import React from 'react';
import CommonCard from '@/components/elements/CommonCard';
import { useRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { HmisEnums } from '@/types/gqlEnums';
import { CeMatchRuleFieldsFragment } from '@/types/gqlTypes';

interface Props {
  title: string;
  rules: CeMatchRuleFieldsFragment[];
}
const MatchRuleCard: React.FC<Props> = ({ title, rules }) => {
  const [access] = useRootPermissions();
  // For CE Admins, display the underlying expressions in tooltips
  const { canAdministrateCoordinatedEntry } = access || {};

  return (
    <CommonCard title={title} TitleComponent={'h3'}>
      <Stack gap={1}>
        {rules.map((rule) => (
          <Stack
            key={rule.id}
            direction='row'
            alignItems='top'
            justifyContent={'space-between'}
          >
            {canAdministrateCoordinatedEntry ? (
              <Tooltip title={rule.expression} arrow placement='top'>
                <span>{rule.name}</span>
              </Tooltip>
            ) : (
              rule.name
            )}

            <Tooltip
              title={`Inherited from ${HmisEnums.CeMatchRuleOwner[rule.ownerType]}`}
              arrow
              placement='top'
            >
              <Typography variant='body2' color='text.secondary' ml={1}>
                {HmisEnums.CeMatchRuleOwner[rule.ownerType]}
              </Typography>
            </Tooltip>
          </Stack>
        ))}
        {rules.length === 0 && (
          <Typography color='text.secondary'>No rules specified.</Typography>
        )}
      </Stack>
    </CommonCard>
  );
};

export default MatchRuleCard;
