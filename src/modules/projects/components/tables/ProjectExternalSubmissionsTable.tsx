import { Button, Card, Chip } from '@mui/material';
import { capitalize } from 'lodash-es';
import React, { useCallback, useMemo, useState } from 'react';
import Loading from '@/components/elements/Loading';
import LoadingButton from '@/components/elements/LoadingButton';
import theme from '@/config/theme';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import { useStaticFormDialog } from '@/modules/form/hooks/useStaticFormDialog';
import { FormValues } from '@/modules/form/types';
import { getItemMap, getOptionValue } from '@/modules/form/util/formUtil';
import { useFilters } from '@/modules/hmis/filterUtil';
import {
  formatRelativeDateTime,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { HmisEnums } from '@/types/gqlEnums';
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
  useBulkReviewExternalSubmissionsMutation,
  useGetExternalFormSubmissionQuery,
} from '@/types/gqlTypes';

const ProjectExternalSubmissionsTable = ({
  projectId,
  formDefinitionIdentifier,
}: {
  projectId: string;
  formDefinitionIdentifier: string;
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    data: { externalFormSubmission: selected } = {},
    error,
    loading,
  } = useGetExternalFormSubmissionQuery({
    variables: {
      id: selectedId || '',
    },
    skip: !selectedId,
  });

  const submissionValues = useMemo(() => {
    if (!selected) return {};
    const itemMap = getItemMap(selected.definition.definition, true);
    const submissionValues: FormValues = {};
    Object.entries(itemMap).forEach(([key, item]) => {
      const { customFieldKey, recordType, fieldName } = item.mapping || {};
      const recordAttrKey =
        recordType && fieldName
          ? `${HmisEnums.RelatedRecordType[recordType]}.${fieldName}`
          : '';

      if (!customFieldKey && !recordAttrKey) return;

      const value = customFieldKey
        ? selected.values[customFieldKey]
        : selected.values[recordAttrKey];

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
      <Card sx={{ p: 2 }}>
        {loading && <Loading />}
        {selected && (
          <DynamicView
            values={submissionValues}
            definition={selected.definition.definition}
          />
        )}
      </Card>
    );
  }, [loading, selected, submissionValues]);

  const { openFormDialog, renderFormDialog, closeDialog } = useStaticFormDialog<
    UpdateExternalFormSubmissionMutation,
    UpdateExternalFormSubmissionMutationVariables
  >({
    formRole: StaticFormRole.ExternalFormSubmissionReview,
    mutationDocument: UpdateExternalFormSubmissionDocument,
    getErrors: (data) => data.updateExternalFormSubmission?.errors || [],
    getVariables: (values) => {
      return {
        id: selectedId || '', // selected should never be undefined when dialog is open
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

  const getColumnDefs = useCallback(() => {
    return [
      {
        header: 'ID',
        render: (s: ExternalFormSubmissionSummaryFragment) => s.id,
      },
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
        render: (s: ExternalFormSubmissionSummaryFragment) => {
          const parsedDate = parseHmisDateString(s.submittedAt);
          if (parsedDate) return formatRelativeDateTime(parsedDate);
          return '';
        },
      },
      {
        header: 'Action',
        render: (s: ExternalFormSubmissionSummaryFragment) => (
          <Button
            variant='outlined'
            onClick={() => {
              setSelectedId(s.id);
              openFormDialog();
            }}
          >
            View
          </Button>
        ),
      },
    ];
  }, [openFormDialog, setSelectedId]);

  const [bulkUpdate, { loading: bulkLoading, error: bulkError }] =
    useBulkReviewExternalSubmissionsMutation({
      refetchQueries: [GetProjectExternalFormSubmissionsDocument],
      awaitRefetchQueries: true,
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
  if (bulkError) throw bulkError;

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
        selectable='checkbox'
        isRowSelectable={(s) =>
          s.status === ExternalFormSubmissionStatus.New && !s.spam
        }
        queryDocument={GetProjectExternalFormSubmissionsDocument}
        getColumnDefs={getColumnDefs}
        noData='No external form submissions'
        pagePath='project.externalFormSubmissions'
        recordType='ExternalFormSubmission'
        paginationItemName='submission'
        filters={filters}
        EnhancedTableToolbarProps={{
          renderBulkAction: (selectedIds, selectedRows) => (
            <LoadingButton
              onClick={() => {
                bulkUpdate({
                  variables: {
                    ids: selectedIds as string[],
                  },
                });
              }}
              loading={bulkLoading}
            >
              Convert {selectedRows.length} to Client
            </LoadingButton>
          ),
        }}
      />
      {renderFormDialog({
        title: `Submission ${selectedId}`,
        otherActions: deleteButton,
      })}
    </>
  );
};

export default ProjectExternalSubmissionsTable;
