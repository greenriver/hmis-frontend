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

interface BaseFormRuleProps {
  projectType?: string;
  project?: string;
  organization?: string;
  dataCollectedAbout?: string;
  funder?: string;
  otherFunder?: string | null;
  serviceCategory?: string;
  serviceType?: string;
  formRole?: FormRole;
  actionButtons?: ReactNode;
}

export const BaseFormRule: React.FC<BaseFormRuleProps> = ({
  projectType,
  project,
  organization,
  dataCollectedAbout = HmisEnums.DataCollectedAbout.ALL_CLIENTS,
  funder,
  otherFunder,
  serviceCategory,
  serviceType,
  formRole,
  actionButtons,
}) => {
  const conditions: Record<string, ReactNode> = {};

  if (!formRole || !nonProjectFormRoles.includes(formRole)) {
    if (projectType)
      conditions.projectType = (
        <FormRuleChip label={`Project Type is ${projectType}`} />
      );
    if (project)
      conditions.project = <FormRuleChip label={`Project is ${project}`} />;
    if (organization)
      conditions.organization = (
        <FormRuleChip label={`Organization is ${organization}`} />
      );
    if (otherFunder) {
      conditions.otherFunder = (
        <FormRuleChip label={`Funding Source is ${otherFunder}`} />
      );
    } else if (funder) {
      conditions.funder = (
        <FormRuleChip label={`Funding Source is ${funder}`} />
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
            <FormRuleChip label={serviceType || serviceCategory || 'Service'} />{' '}
            for{' '}
          </>
        ) : (
          `Applies ${isClientForm ? 'to ' : ''}`
        )}
        {isClientForm && (
          <>
            <FormRuleChip label={dataCollectedAbout} />{' '}
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

interface FormRuleProps {
  rule: FormRuleFieldsFragment;
  formRole?: FormRole;
  actionButtons?: ReactNode;
}
export const FormRule: React.FC<FormRuleProps> = ({
  rule,
  formRole,
  actionButtons,
}) => {
  return (
    <BaseFormRule
      project={rule.project?.projectName}
      projectType={
        rule.projectType ? HmisEnums.ProjectType[rule.projectType] : ''
      }
      organization={rule.organization?.organizationName}
      dataCollectedAbout={
        rule.dataCollectedAbout
          ? HmisEnums.DataCollectedAbout[rule.dataCollectedAbout]
          : HmisEnums.DataCollectedAbout.ALL_CLIENTS
      }
      funder={rule.funder ? HmisEnums.FundingSource[rule.funder] : ''}
      otherFunder={rule.otherFunder}
      serviceCategory={rule.serviceCategory?.name}
      serviceType={rule.serviceType?.name}
      formRole={formRole}
      actionButtons={actionButtons}
    />
  );
};

interface ProjectConfigFormRuleProps {
  rule: ProjectConfigFieldsFragment;
  formRole?: FormRole;
  actionButtons?: ReactNode;
}
export const ProjectConfigFormRule: React.FC<ProjectConfigFormRuleProps> = ({
  rule,
  formRole,
  actionButtons,
}) => {
  return (
    <BaseFormRule
      project={rule.project?.projectName}
      projectType={
        rule.projectType ? HmisEnums.ProjectType[rule.projectType] : ''
      }
      organization={rule.organization?.organizationName}
      formRole={formRole}
      actionButtons={actionButtons}
    />
  );
};
