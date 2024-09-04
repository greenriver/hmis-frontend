import { Card, Chip } from '@mui/material';
import { capitalize } from 'lodash-es';
import React, { useCallback, useMemo, useState } from 'react';
import theme from '@/config/theme';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import { FormValues } from '@/modules/form/types';
import { getItemMap, getOptionValue } from '@/modules/form/util/formUtil';
import { useFilters } from '@/modules/hmis/filterUtil';
import { parseAndFormatDateTime } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import {
  DeleteExternalFormSubmissionDocument,
  DeleteExternalFormSubmissionMutation,
  DeleteExternalFormSubmissionMutationVariables,
  ExternalFormSubmissionFilterOptions,
  ExternalFormSubmissionInput,
  ExternalFormSubmissionStatus,
  ExternalFormSubmissionSummaryFragment,
  GetProjectExternalFormSubmissionsDocument,
  GetProjectExternalFormSubmissionsQuery,
  GetProjectExternalFormSubmissionsQueryVariables,
  StaticFormRole,
  UpdateExternalFormSubmissionDocument,
  UpdateExternalFormSubmissionMutation,
  UpdateExternalFormSubmissionMutationVariables,
  useGetExternalFormSubmissionQuery,
} from '@/types/gqlTypes';

const ProjectExternalSubmissionsTable = ({
  projectId,
  formDefinitionIdentifier,
}: {
  projectId: string;
  formDefinitionIdentifier: string;
}) => {
  const getColumnDefs = useCallback(() => {
    return [
      {
        header: 'Status',
        linkTreatment: false,
        render: (s: ExternalFormSubmissionSummaryFragment) => {
          const isNew = s.status === ExternalFormSubmissionStatus.New;
          return (
            <>
              <Chip
                label={capitalize(s.status)}
                size='small'
                color={isNew ? 'primary' : 'default'}
                variant={isNew ? 'filled' : 'outlined'}
                sx={isNew ? {} : { color: theme.palette.text.secondary }}
              />
              {s.spam && (
                <Chip
                  label='Spam'
                  size='small'
                  color='error'
                  variant='outlined'
                  sx={{ ml: 1, color: theme.palette.error.dark }}
                />
              )}
            </>
          );
        },
      },
      {
        header: 'Date Submitted',
        linkTreatment: false,
        render: (s: ExternalFormSubmissionSummaryFragment) =>
          parseAndFormatDateTime(s.submittedAt),
      },
    ];
  }, []);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: { externalFormSubmission: selected } = {}, error } =
    useGetExternalFormSubmissionQuery({
      variables: {
        id: selectedId || '',
      },
      skip: !selectedId,
    });

  const submissionValues = useMemo(() => {
    if (!selected) return {};
    const itemMap = getItemMap(selected.definition.definition, true);
    const submissionValues: FormValues = {};
    Object.keys(itemMap).forEach((key) => {
      const item = itemMap[key];
      const customFieldKey = item.mapping?.customFieldKey;
      const value = customFieldKey
        ? selected.values[customFieldKey]
        : selected.values[key];

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
  }, [selected]);

  const valuesViewComponent = useMemo(() => {
    return (
      <>
        {selected && (
          <Card sx={{ p: 2 }}>
            <DynamicView
              values={submissionValues}
              definition={selected.definition.definition}
            />
          </Card>
        )}
      </>
    );
  }, [selected, submissionValues]);

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
        projectId: projectId,
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
        setSelectedId(null);
      }
    },
    onClose: () => setSelectedId(null),
    beforeFormComponent: valuesViewComponent,
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
            setSelectedId(null);
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

  if (error) throw error;

  return (
    <>
      <GenericTableWithData<
        GetProjectExternalFormSubmissionsQuery,
        GetProjectExternalFormSubmissionsQueryVariables,
        ExternalFormSubmissionSummaryFragment,
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
          setSelectedId(row.id);
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
