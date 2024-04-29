import { Card, Chip } from '@mui/material';
import { capitalize } from 'lodash-es';
import React, { useCallback, useMemo, useState } from 'react';
import Loading from '@/components/elements/Loading';
import theme from '@/config/theme';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import { FormValues } from '@/modules/form/types';
import { getItemMap, getOptionValue } from '@/modules/form/util/formUtil';
import { useFilters } from '@/modules/hmis/filterUtil';
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
  useGetExternalFormDefinitionQuery,
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
  const { data, loading, error } = useGetExternalFormDefinitionQuery({
    variables: { formDefinitionIdentifier: formDefinitionIdentifier },
    skip: !formDefinitionIdentifier,
  });
  const definition = data?.externalFormDefinition;

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
    if (!selected || !definition) return {};
    const itemMap = getItemMap(definition.definition, true);
    const submissionValues: FormValues = {};
    Object.keys(itemMap).forEach((key) => {
      const item = itemMap[key];
      const customFieldKey = item.mapping?.customFieldKey;
      if (!customFieldKey) return;

      const value = customDataElementValueForKey(
        customFieldKey,
        selected.customDataElements
      );

      // if item has a picklist, convert value to PickListOption(s) so we can display the readable label
      if (item.pickListOptions) {
        if (Array.isArray(value)) {
          submissionValues[key] = value.map((v) => getOptionValue(v, item));
        } else {
          submissionValues[key] = getOptionValue(value, item);
        }
      } else {
        submissionValues[key] = value;
      }
    });
    return submissionValues;
  }, [selected, definition]);

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
    beforeFormComponent: selected && definition && (
      <Card sx={{ p: 2 }}>
        <DynamicView
          values={submissionValues}
          definition={definition.definition}
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

  const filters = useFilters({
    type: 'ExternalFormSubmissionFilterOptions',
  });

  if (loading) return <Loading />;
  if (error) throw error;

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
        filters={filters}
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
