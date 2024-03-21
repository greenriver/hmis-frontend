import { Card, Chip } from '@mui/material';
import { capitalize } from 'lodash-es';
import React, { useCallback, useMemo, useState } from 'react';
import theme from '@/config/theme';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import { FormValues } from '@/modules/form/types';
import { getItemMap } from '@/modules/form/util/formUtil';
import {
  customDataElementValueForKey,
  getCustomDataElementColumns,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import {
  DeleteExternalFormSubmissionDocument,
  DeleteExternalFormSubmissionMutation,
  DeleteExternalFormSubmissionMutationVariables,
  ExternalFormSubmissionFieldsFragment,
  ExternalFormSubmissionFilterOptions,
  ExternalFormSubmissionInput,
  ExternalFormSubmissionStatus,
  GetProjectExternalFormSubmissionsDocument,
  GetProjectExternalFormSubmissionsQuery,
  GetProjectExternalFormSubmissionsQueryVariables,
  StaticFormRole,
  UpdateExternalFormSubmissionDocument,
  UpdateExternalFormSubmissionMutation,
  UpdateExternalFormSubmissionMutationVariables,
} from '@/types/gqlTypes';

export type ExternalFormSubmissionFields = NonNullable<
  GetProjectExternalFormSubmissionsQuery['project']
>['externalFormSubmissions']['nodes'][number];

const ProjectExternalSubmissionsTable = ({
  projectId,
  formDefinitionIdentifier,
}: {
  projectId: string;
  formDefinitionIdentifier: string;
}) => {
  const getColumnDefs = useCallback((rows: ExternalFormSubmissionFields[]) => {
    const customColumns = getCustomDataElementColumns(rows);
    return [
      {
        header: 'Status',
        linkTreatment: false,
        render: (s: ExternalFormSubmissionFieldsFragment) => {
          const isNew = s.status === ExternalFormSubmissionStatus.New;
          return (
            <Chip
              label={capitalize(s.status)}
              size='small'
              color={isNew ? 'primary' : 'default'}
              variant={isNew ? 'filled' : 'outlined'}
              sx={isNew ? {} : { color: theme.palette.text.secondary }}
            />
          );
        },
      },
      {
        header: 'Date Submitted',
        linkTreatment: false,
        render: (s: ExternalFormSubmissionFieldsFragment) =>
          parseAndFormatDateTime(s.submittedAt),
      },
      ...customColumns,
    ];
  }, []);

  const [selected, setSelected] =
    useState<ExternalFormSubmissionFieldsFragment | null>(null);

  const submissionValues = useMemo(() => {
    if (!selected) return {};
    const itemMap = getItemMap(selected.definition.definition, true);
    const submissionValues: FormValues = {};
    Object.keys(itemMap).forEach((key) => {
      const pickListOptions = itemMap[key].pickListOptions;
      const customFieldKey = itemMap[key].mapping?.customFieldKey;
      if (!customFieldKey) return;

      const value = customDataElementValueForKey(
        customFieldKey,
        selected.customDataElements
      );
      if (pickListOptions) {
        submissionValues[key] = pickListOptions.find((o) => o.code === value);
      } else {
        submissionValues[key] = value;
      }
    });
    return submissionValues;
  }, [selected]);

  const { openFormDialog, renderFormDialog, closeDialog } = useStaticFormDialog<
    UpdateExternalFormSubmissionMutation,
    UpdateExternalFormSubmissionMutationVariables
  >({
    formRole: StaticFormRole.ExternalFormSubmissionReview,
    mutationDocument: UpdateExternalFormSubmissionDocument,
    getErrors: (data) => data.updateExternalFormSubmission?.errors || [],
    getVariables: (values) => {
      return {
        id: selected?.id || '', // selected should never be undefined when dialog is open
        input: {
          notes: values.notes,
          status: values.reviewed
            ? ExternalFormSubmissionStatus.Reviewed
            : ExternalFormSubmissionStatus.New,
          spam: values.spam,
        } as ExternalFormSubmissionInput,
      };
    },
    initialValues: selected
      ? {
          notes: selected.notes,
          reviewed: selected.status === ExternalFormSubmissionStatus.Reviewed,
          spam: selected.spam,
        }
      : {},
    onCompleted: (data) => {
      if (!data?.updateExternalFormSubmission?.errors?.length) {
        setSelected(null);
      }
    },
    onClose: () => setSelected(null),
    beforeFormComponent: selected && (
      <Card sx={{ p: 2 }}>
        <DynamicView
          values={submissionValues}
          definition={selected.definition.definition}
        />
      </Card>
    ),
  });

  const deleteButton = useMemo(
    () =>
      selected && (
        <DeleteMutationButton<
          DeleteExternalFormSubmissionMutation,
          DeleteExternalFormSubmissionMutationVariables
        >
          queryDocument={DeleteExternalFormSubmissionDocument}
          variables={{ id: selected.id }}
          idPath={'deleteExternalFormSubmission.externalFormSubmission.id'}
          recordName='Submission'
          onSuccess={() => {
            cache.evict({
              id: `ExternalFormSubmission:${selected.id}`,
            });
            setSelected(null);
            closeDialog();
          }}
          onlyIcon
        />
      ),
    [closeDialog, selected]
  );

  return (
    <>
      <GenericTableWithData<
        GetProjectExternalFormSubmissionsQuery,
        GetProjectExternalFormSubmissionsQueryVariables,
        ExternalFormSubmissionFields,
        ExternalFormSubmissionFilterOptions
      >
        queryVariables={{
          id: projectId,
          formDefinitionIdentifier: formDefinitionIdentifier,
        }}
        queryDocument={GetProjectExternalFormSubmissionsDocument}
        getColumnDefs={getColumnDefs}
        noData='No external form submissions'
        pagePath='project.externalFormSubmissions'
        recordType='ExternalFormSubmission'
        paginationItemName='submission'
        showFilters
        filterInputType='ExternalFormSubmissionFilterOptions'
        handleRowClick={(row) => {
          setSelected(row);
          openFormDialog();
        }}
      />
      {renderFormDialog({
        title: 'Review Submission',
        otherActions: deleteButton,
      })}
    </>
  );
};

export default ProjectExternalSubmissionsTable;
