import {
  Card,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import TextInput from '@/components/elements/input/TextInput';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import FormDialogActionContent from '@/modules/form/components/FormDialogActionContent';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import { FormValues } from '@/modules/form/types';
import { getItemMap, getOptionValue } from '@/modules/form/util/formUtil';
import { customDataElementValueForKey } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import {
  DeleteExternalFormSubmissionDocument,
  DeleteExternalFormSubmissionMutation,
  DeleteExternalFormSubmissionMutationVariables,
  ExternalFormSubmissionFieldsFragment,
  ExternalFormSubmissionInput,
  ExternalFormSubmissionStatus,
  FormDefinitionFieldsFragment,
  useUpdateExternalFormSubmissionMutation,
} from '@/types/gqlTypes';

const ExternalSubmissionsViewModal = ({
  selected,
  onClose,
  definition,
}: {
  selected: ExternalFormSubmissionFieldsFragment;
  onClose: VoidFunction;
  definition: FormDefinitionFieldsFragment;
}) => {
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

  const [notes, setNotes] = useState(selected.notes || '');
  const [status, setStatus] = useState(
    selected.status || ExternalFormSubmissionStatus.New
  );
  const [spam, setSpam] = useState(selected.spam || false);

  const [updateSubmission, { loading, error }] =
    useUpdateExternalFormSubmissionMutation({
      variables: {
        id: selected.id,
        input: {
          notes: notes,
          status: status,
          spam: spam,
        } as ExternalFormSubmissionInput,
      },
      onCompleted: (data) => {
        if (!data?.updateExternalFormSubmission?.errors?.length) {
          onClose();
        }
      },
    });

  if (error) throw error;

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
            onClose();
          }}
          onlyIcon
        />
      ),
    [onClose, selected]
  );

  return (
    <CommonDialog open={!!selected && !!definition} fullWidth onClose={onClose}>
      <DialogTitle>Review Submission</DialogTitle>
      <DialogContent>
        <Stack gap={2} sx={{ my: 2 }}>
          <Card sx={{ p: 2 }}>
            <DynamicView
              values={submissionValues}
              definition={definition.definition}
            />
          </Card>
          <Stack gap={1}>
            <TextInput
              value={notes}
              label='Reviewer Notes'
              multiline
              minRows={2}
              onChange={(event) => setNotes(event.target.value)}
            />
            <LabeledCheckbox
              value={status === ExternalFormSubmissionStatus.Reviewed}
              label='Mark as Reviewed'
              onChange={(_e, checked) => {
                setStatus(
                  checked
                    ? ExternalFormSubmissionStatus.Reviewed
                    : ExternalFormSubmissionStatus.New
                );
              }}
            />
            <LabeledCheckbox
              value={spam}
              label='Mark as Spam'
              onChange={(_e, checked) => setSpam(checked)}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <FormDialogActionContent
          onSubmit={() => updateSubmission()}
          onDiscard={onClose}
          submitLoading={loading}
          otherActions={deleteButton}
        />
      </DialogActions>
    </CommonDialog>
  );
};

export default ExternalSubmissionsViewModal;
