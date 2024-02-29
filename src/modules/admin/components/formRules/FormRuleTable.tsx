import { Chip, IconButton } from '@mui/material';
import { Stack } from '@mui/system';
import { omit } from 'lodash-es';
import React, { useMemo, useState } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import NotCollectedText from '@/components/elements/NotCollectedText';
import { EditIcon } from '@/components/elements/SemanticIcons';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import ProjectTypeChip from '@/modules/hmis/components/ProjectTypeChip';
import { HmisEnums } from '@/types/gqlEnums';

import {
  DataCollectedAbout,
  FormRole,
  FormRuleFieldsFragment,
  FormRuleInput,
  GetFormRulesDocument,
  GetFormRulesQuery,
  GetFormRulesQueryVariables,
  MutationUpdateFormRuleArgs,
  StaticFormRole,
  UpdateFormRuleDocument,
  UpdateFormRuleMutation,
} from '@/types/gqlTypes';

export const ActiveChip = ({ active }: { active: boolean }) => (
  <Chip
    label={active ? 'Active' : 'Inactive'}
    size='small'
    color={active ? 'success' : 'default'}
    variant='outlined'
    sx={{ width: 'fit-content' }}
  />
);

type RowType = FormRuleFieldsFragment;

const FormRuleColumns: Record<string, ColumnDef<RowType>> = {
  id: {
    header: 'ID',
    render: 'id',
    linkTreatment: true,
    width: '80px',
  },
  projectApplicability: {
    header: 'Project Applicability',
    render: ({ projectType, funder, otherFunder, project, organization }) => {
      if (
        !projectType &&
        !funder &&
        !otherFunder &&
        !project &&
        !organization
      ) {
        return 'All Projects';
      }

      return (
        <Stack
          sx={{
            '.MuiChip-root': { width: 'fit-content', px: 1 },
            maxWidth: '350px',
          }}
          gap={1}
          direction='row'
        >
          {projectType && (
            <ProjectTypeChip projectType={projectType} variant='filled' />
          )}
          {funder && (
            <Chip size='small' label={HmisEnums.FundingSource[funder]} />
          )}
          {otherFunder && <Chip size='small' label={otherFunder} />}
          {project && <Chip size='small' label={project.projectName} />}
          {organization && (
            <Chip size='small' label={organization.organizationName} />
          )}
        </Stack>
      );
    },
  },
  serviceApplicability: {
    header: 'Service Applicability',
    render: ({ serviceType, serviceCategory }) => {
      if (serviceType) return serviceType.name;
      if (serviceCategory) return serviceCategory.name;
      return <NotCollectedText>None</NotCollectedText>;
    },
  },
  dataCollectedAbout: {
    header: 'Client Applicability',
    render: ({ dataCollectedAbout }) =>
      HmisEnums.DataCollectedAbout[
        dataCollectedAbout || DataCollectedAbout.AllClients
      ],
  },
  activeStatus: {
    header: 'Status',
    render: ({ active }) => <ActiveChip active={active} />,
  },
};

const FORM_RULE_COLUMNS: ColumnDef<RowType>[] = [
  FormRuleColumns.id,
  FormRuleColumns.serviceApplicability,
  FormRuleColumns.projectApplicability,
  FormRuleColumns.dataCollectedAbout,
  FormRuleColumns.activeStatus,
];

interface Props {
  formRole: FormRole;
  queryVariables: GetFormRulesQueryVariables;
}

const FormRuleTable: React.FC<Props> = ({ formRole, queryVariables }) => {
  // Currently selected rule for editing
  const [selectedRule, setSelectedRule] = useState<RowType | undefined>();

  // Form dialog for editing rules
  const { openFormDialog, renderFormDialog } = useStaticFormDialog<
    UpdateFormRuleMutation,
    MutationUpdateFormRuleArgs
  >({
    formRole: StaticFormRole.FormRule,
    initialValues: selectedRule,
    mutationDocument: UpdateFormRuleDocument,
    getErrors: (data) => data.updateFormRule?.errors || [],
    getVariables: (values) => ({
      input: { input: values as FormRuleInput, id: selectedRule?.id || '' },
    }),
    onCompleted: () => {},
    onClose: () => setSelectedRule(undefined),
  });

  const columns: typeof FORM_RULE_COLUMNS = useMemo(() => {
    const cols: typeof FORM_RULE_COLUMNS = [];

    if (formRole === FormRole.Service) {
      cols.push(FormRuleColumns.serviceApplicability);
    }

    const nonProjectFormRoles = [FormRole.Organization];
    if (!nonProjectFormRoles.includes(formRole)) {
      cols.push(FormRuleColumns.projectApplicability);
    }

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
    if (!nonClientFormRoles.includes(formRole)) {
      cols.push(FormRuleColumns.dataCollectedAbout);
    }
    cols.push(FormRuleColumns.activeStatus);

    cols.push({
      key: 'action',
      textAlign: 'right',
      render: (row) => {
        return (
          <ButtonTooltipContainer
            title={row.system ? 'System rule' : undefined}
          >
            <IconButton
              aria-label='edit form rule'
              disabled={row.system}
              onClick={() => {
                setSelectedRule(row);
                openFormDialog();
              }}
              size='small'
            >
              <EditIcon fontSize='inherit' />
            </IconButton>
          </ButtonTooltipContainer>
        );
      },
    });
    return cols;
  }, [formRole, openFormDialog]);

  return (
    <>
      <GenericTableWithData<
        GetFormRulesQuery,
        GetFormRulesQueryVariables,
        RowType
      >
        queryVariables={queryVariables}
        queryDocument={GetFormRulesDocument}
        columns={columns}
        pagePath='formRules'
        noData='No form rules'
        showFilters
        recordType='FormRule'
        filterInputType='FormRuleFilterOptions'
        paginationItemName='rule'
        filters={(filters) => omit(filters, 'definition', 'formType')}
        noSort
        // tableProps={{ sx: { tableLayout: 'fixed' } }}
      />
      {renderFormDialog({
        title: 'Edit Rule',
        DialogProps: { maxWidth: 'sm' },
      })}
    </>
  );
};
export default FormRuleTable;
