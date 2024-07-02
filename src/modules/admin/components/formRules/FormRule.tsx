import { Chip, Stack, Typography } from '@mui/material';
import React, { ReactNode } from 'react';
import { HmisEnums } from '@/types/gqlEnums';
import { FormRole, FormRuleFieldsFragment } from '@/types/gqlTypes';

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

const nonClientFormRoles = [
  FormRole.CeParticipation,
  FormRole.Funder,
  FormRole.HmisParticipation,
  FormRole.Inventory,
  FormRole.Organization,
  FormRole.Project,
  FormRole.ProjectCoc,
  FormRole.ReferralRequest,
];

const nonProjectFormRoles = [FormRole.Organization];

interface Props {
  rule: FormRuleFieldsFragment;
  formRole: FormRole;
}

const FormRule: React.FC<Props> = ({ rule, formRole }) => {
  const {
    dataCollectedAbout,
    projectType,
    project,
    organization,
    funder,
    otherFunder,
    active,
    serviceCategory,
    serviceType,
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

  if (formRole === FormRole.Service) {
    if (serviceType) {
      conditions.serviceType = (
        <FormRuleChip label={`Service is ${serviceType.name}`} />
      );
    } else if (serviceCategory) {
      conditions.serviceCategory = (
        <FormRuleChip label={`Service is ${serviceCategory.name}`} />
      );
    }
  }

  if (!nonProjectFormRoles.includes(formRole)) {
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
  }

  const nonClient = nonClientFormRoles.includes(formRole);

  const conditionCount = Object.keys(conditions).length;

  return (
    <Stack direction='row' gap={2}>
      <Typography variant='body2' sx={{ flexGrow: 1 }}>
        {!nonClient && <>Applies to {appliesTo}</>}
        {nonClient && conditionCount === 0 && (
          <>
            Applies to <FormRuleChip label='All Projects' />
          </>
        )}
        {conditionCount > 0 && (
          <>
            {nonClient ? 'If ' : ' if '}
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
