import { Chip, Stack, Typography } from '@mui/material';
import React, { ReactNode } from 'react';
import { HmisEnums } from '@/types/gqlEnums';
import {
  DataCollectedAbout,
  FormRole,
  FormRuleFieldsFragment,
  FundingSource,
  ProjectConfigFieldsFragment,
  ProjectType,
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
  projectType?: ProjectType;
  projectName?: string;
  organizationName?: string;
  dataCollectedAbout?: DataCollectedAbout;
  funder?: FundingSource;
  otherFunder?: string;
  serviceCategoryName?: string;
  serviceTypeName?: string;
  formRole?: FormRole;
  actionButtons?: ReactNode;
}

export const BaseFormRule: React.FC<BaseFormRuleProps> = ({
  projectType,
  projectName,
  organizationName,
  dataCollectedAbout = DataCollectedAbout.AllClients,
  funder,
  otherFunder,
  serviceCategoryName,
  serviceTypeName,
  formRole,
  actionButtons,
}) => {
  const conditions: Record<string, ReactNode> = {};

  if (!formRole || !nonProjectFormRoles.includes(formRole)) {
    if (projectType)
      conditions.projectType = (
        <FormRuleChip
          label={`Project Type is ${projectType ? HmisEnums.ProjectType[projectType] : ''}`}
        />
      );
    if (projectName)
      conditions.project = <FormRuleChip label={`Project is ${projectName}`} />;
    if (organizationName)
      conditions.organization = (
        <FormRuleChip label={`Organization is ${organizationName}`} />
      );
    if (otherFunder) {
      conditions.otherFunder = (
        <FormRuleChip label={`Funding Source is ${otherFunder}`} />
      );
    } else if (funder) {
      conditions.funder = (
        <FormRuleChip
          label={`Funding Source is ${funder ? HmisEnums.FundingSource[funder] : ''}`}
        />
      );
    }
  }

  const isServiceForm =
    formRole === FormRole.Service && (serviceTypeName || serviceCategoryName);

  const isClientForm = formRole && !nonClientFormRoles.includes(formRole);

  const conditionCount = Object.keys(conditions).length;

  return (
    <Stack direction='row' gap={2}>
      <Typography variant='body2' sx={{ flexGrow: 1 }}>
        {isServiceForm ? (
          <>
            Collects{' '}
            <FormRuleChip
              label={serviceTypeName || serviceCategoryName || 'Service'}
            />{' '}
            for{' '}
          </>
        ) : (
          `Applies ${isClientForm ? 'to ' : ''}`
        )}
        {isClientForm && (
          <>
            <FormRuleChip
              label={HmisEnums.DataCollectedAbout[dataCollectedAbout]}
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
      projectName={rule.project?.projectName}
      projectType={rule.projectType || undefined}
      organizationName={rule.organization?.organizationName}
      dataCollectedAbout={rule.dataCollectedAbout || undefined}
      funder={rule.funder || undefined}
      otherFunder={rule.otherFunder || undefined}
      serviceCategoryName={rule.serviceCategory?.name}
      serviceTypeName={rule.serviceType?.name}
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
      projectName={rule.project?.projectName}
      projectType={rule.projectType || undefined}
      organizationName={rule.organization?.organizationName}
      formRole={formRole}
      actionButtons={actionButtons}
    />
  );
};
