import { Chip, Stack, Typography } from '@mui/material';
import React, { ReactNode } from 'react';
import { HmisEnums } from '@/types/gqlEnums';
import { FormRuleFieldsFragment } from '@/types/gqlTypes';

const FormRuleChip: React.FC<{ label: string }> = ({ label }) => {
  // bottom margin puts the chip text in line with the body text
  return <Chip component='span' sx={{ mb: 0.25 }} size='small' label={label} />;
};

const ActiveChip = ({ active }: { active: boolean }) => (
  <Chip
    label={active ? 'Active' : 'Inactive'}
    size='small'
    color={active ? 'success' : 'default'}
    variant='outlined'
    sx={{ width: 'fit-content' }}
  />
);

interface Props {
  rule: Partial<FormRuleFieldsFragment>;
}

const FormRule: React.FC<Props> = ({ rule }) => {
  const {
    dataCollectedAbout,
    projectType,
    project,
    organization,
    funder,
    otherFunder,
    active,
  } = rule;

  const appliesTo = (
    <FormRuleChip
      label={
        dataCollectedAbout
          ? HmisEnums.DataCollectedAbout[dataCollectedAbout]
          : 'All Clients'
      }
    />
  );

  const conditions: Record<string, ReactNode> = {};

  if (projectType)
    conditions.projectType = (
      <FormRuleChip
        label={`Project Type is ${HmisEnums.ProjectType[projectType]}`}
      />
    );
  if (project)
    conditions.project = (
      <FormRuleChip label={`Project is ${project.projectName}`} />
    );
  if (organization)
    conditions.organization = (
      <FormRuleChip
        label={`Organization is ${organization.organizationName}`}
      />
    );
  if (otherFunder) {
    conditions.otherFunder = (
      <FormRuleChip label={`Funding Source is ${otherFunder}`} />
    );
  } else if (funder) {
    conditions.funder = (
      <FormRuleChip
        label={`Funding Source is ${HmisEnums.FundingSource[funder]}`}
      />
    );
  }

  const conditionCount = Object.keys(conditions).length;

  return (
    <Stack direction='row' gap={2}>
      <Typography variant='body2' sx={{ flexGrow: 1 }}>
        Applies to {appliesTo}
        {conditionCount > 0 && (
          <>
            {' '}
            if{' '}
            {Object.entries(conditions).map(([key, condition], i) => {
              return (
                <span key={key}>
                  {condition}
                  {i < conditionCount - 1 && ' and '}
                </span>
              );
            })}
          </>
        )}
      </Typography>
      <ActiveChip
        active={active || false}
        // TODO(#6289) - Deletion should deactivate. Inactive rules should not be shown/returned
      />
    </Stack>
  );
};

export default FormRule;
