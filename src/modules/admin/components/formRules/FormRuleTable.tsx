import { Chip, IconButton } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { generatePath } from 'react-router-dom';
import ProjectApplicabilitySummary from './ProjectApplicabilitySummary';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import NotCollectedText from '@/components/elements/NotCollectedText';
import RouterLink from '@/components/elements/RouterLink';
import { EditIcon } from '@/components/elements/SemanticIcons';
import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import {
  getInputTypeForRecordType,
  useFilters,
} from '@/modules/hmis/filterUtil';
import { AdminDashboardRoutes } from '@/routes/routes';
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

export const FormRuleColumns: Record<string, ColumnDef<RowType>> = {
  id: {
    header: 'ID',
    render: 'id',
    linkTreatment: true,
    width: '80px',
  },
  projectApplicability: {
    header: 'Project Applicability',
    render: (rule) => <ProjectApplicabilitySummary rule={rule} />,
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
  formDefinition: {
    header: 'Form',
    render: ({ definitionTitle, definitionId }) => (
      <RouterLink
        to={generatePath(AdminDashboardRoutes.VIEW_FORM, {
          formId: definitionId,
        })}
        openInNew
      >
        {definitionTitle}
      </RouterLink>
    ),
  },
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

interface Props {
  formRole: FormRole;
  queryVariables: GetFormRulesQueryVariables;
  columns?: ColumnDef<RowType>[];
}

const FormRuleTable: React.FC<Props> = ({
  formRole,
  queryVariables,
  columns: columnsOverride,
}) => {
  // Currently selected rule for editing
  const [selectedRule, setSelectedRule] = useState<RowType | undefined>();

  // Form dialog for editing rules
  const { openFormDialog, renderFormDialog } = useStaticFormDialog<
    UpdateFormRuleMutation,
    MutationUpdateFormRuleArgs
  >({
    formRole: StaticFormRole.FormRule,
    initialValues: {
      ...selectedRule,
      // hack: pass service type ids as initial values. We should resolve these on FormRule instead
      serviceTypeId: selectedRule?.serviceType?.id,
      serviceCategoryId: selectedRule?.serviceCategory?.id,
    },
    mutationDocument: UpdateFormRuleDocument,
    localConstants: { formRole },
    getErrors: (data) => data.updateFormRule?.errors || [],
    getVariables: (values) => ({
      input: { input: values as FormRuleInput, id: selectedRule?.id || '' },
    }),
    onCompleted: () => {},
    onClose: () => setSelectedRule(undefined),
  });

  const columns: ColumnDef<RowType>[] = useMemo(() => {
    if (columnsOverride) return columnsOverride;

    const cols: ColumnDef<RowType>[] = [FormRuleColumns.id];
    if (formRole === FormRole.Service) {
      cols.push(FormRuleColumns.serviceApplicability);
    }

    const nonProjectFormRoles = [FormRole.Organization];
    if (!nonProjectFormRoles.includes(formRole)) {
      cols.push(FormRuleColumns.projectApplicability);
    }

    if (!nonClientFormRoles.includes(formRole)) {
      cols.push(FormRuleColumns.dataCollectedAbout);
    }

    cols.push(FormRuleColumns.activeStatus);
    cols.push({
      key: 'action',
      textAlign: 'right',
      render: (row: RowType) => {
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
  }, [formRole, openFormDialog, columnsOverride]);

  const filters = useFilters({
    type: getInputTypeForRecordType('FormRule'),
    omit: ['definition', 'formType'],
  });

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
        showTopToolbar
        filters={filters}
        recordType='FormRule'
        paginationItemName='rule'
        noSort
      />
      {renderFormDialog({
        title: 'Edit Rule',
        DialogProps: { maxWidth: 'sm' },
      })}
    </>
  );
};
export default FormRuleTable;
