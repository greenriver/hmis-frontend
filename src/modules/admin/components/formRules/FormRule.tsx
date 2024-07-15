import { Chip, Stack, Typography } from '@mui/material';
import React, { ReactNode } from 'react';
import { HmisEnums } from '@/types/gqlEnums';
import {
  FormRole,
  FormRuleFieldsFragment,
  ProjectConfigFieldsFragment,
} from '@/types/gqlTypes';

const FormRuleChip: React.FC<{ label: string }> = ({ label }) => {
  // bottom margin puts the chip text in line with the body text
  return <Chip component='span' sx={{ mb: 0.25 }} size='small' label={label} />;
};

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
  rule: FormRuleFieldsFragment | ProjectConfigFieldsFragment;
  formRole?: FormRole;
  actionButtons?: ReactNode;
}

function isFormRuleFragment(
  obj: FormRuleFieldsFragment | ProjectConfigFieldsFragment
): obj is FormRuleFieldsFragment {
  return obj && obj.hasOwnProperty('funder');
}

const FormRule: React.FC<Props> = ({ rule, formRole, actionButtons }) => {
  // Fields that are shared across Project Configs and Form Rules
  const { projectType, project, organization } = rule;

  // Fields that are specific to Form Rules
  let dataCollectedAbout;
  let funder;
  let otherFunder;
  let serviceCategory;
  let serviceType;
  if (isFormRuleFragment(rule)) {
    dataCollectedAbout = rule.dataCollectedAbout;
    funder = rule.funder;
    otherFunder = rule.otherFunder;
    serviceCategory = rule.serviceCategory;
    serviceType = rule.serviceType;
  }

  const conditions: Record<string, ReactNode> = {};

  if (!formRole || !nonProjectFormRoles.includes(formRole)) {
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

  const isServiceForm =
    formRole === FormRole.Service && (serviceType || serviceCategory);

  const isClientForm = formRole && !nonClientFormRoles.includes(formRole);

  const conditionCount = Object.keys(conditions).length;

  return (
    <Stack direction='row' gap={2}>
      <Typography variant='body2' sx={{ flexGrow: 1 }}>
        {isServiceForm ? (
          <>
            Collects{' '}
            <FormRuleChip
              label={serviceType?.name || serviceCategory?.name || 'Service'}
            />{' '}
            for{' '}
          </>
        ) : (
          `Applies ${isClientForm ? 'to ' : ''}`
        )}
        {isClientForm && (
          <>
            <FormRuleChip
              label={
                dataCollectedAbout
                  ? HmisEnums.DataCollectedAbout[dataCollectedAbout]
                  : HmisEnums.DataCollectedAbout.ALL_CLIENTS
              }
            />{' '}
          </>
        )}
        {conditionCount === 0 && (
          <>
            in <FormRuleChip label='All Projects' />
          </>
        )}
        {conditionCount > 0 && (
          <>
            {' if '}
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
      {actionButtons}
    </Stack>
  );
};

export default FormRule;
