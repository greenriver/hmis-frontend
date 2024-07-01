import { Chip, Stack, Typography } from '@mui/material';
import React from 'react';
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

const FormRule: React.FC<Props> = ({
  rule,
}) => {
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

  const conditions = [];

  if (projectType)
    conditions.push(
      <FormRuleChip
        label={`Project Type is ${HmisEnums.ProjectType[projectType]}`}
      />
    );
  if (project)
    conditions.push(
      <FormRuleChip label={`Project is ${project.projectName}`} />
    );
  if (organization)
    conditions.push(
      <FormRuleChip
        label={`Organization is ${organization.organizationName}`}
      />
    );
  if (otherFunder) {
    conditions.push(
      <FormRuleChip label={`Funding Source is ${otherFunder}`} />
    );
  } else if (funder) {
    conditions.push(
      <FormRuleChip
        label={`Funding Source is ${HmisEnums.FundingSource[funder]}`}
      />
    );
  }

  return (
    <Stack direction='row' gap={2}>
      <Typography variant='body2' sx={{ flexGrow: 1 }}>
        Applies to {appliesTo}
        {conditions.length > 0 && (
          <>
            {' '}
            if{' '}
            {conditions.map((condition, i) => {
              return (
                <span key={condition.key}>
                  {condition}
                  {i < conditions.length - 1 && ' and '}
                </span>
              );
            })}
          </>
        )}
      </Typography>
      <ActiveChip
        active={active || false}
        // todo @martha - any other treatment style in the table for active rules?
        // todo @martha - enable deactivation (not deletion)
      />
    </Stack>
  );
};

export default FormRule;
