import { DialogContent, DialogProps, DialogTitle } from '@mui/material';
import { Box } from '@mui/system';
import React, { useMemo } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import StaticForm from '@/modules/form/components/StaticForm';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import { FormValues } from '@/modules/form/types';
import { getItemMap } from '@/modules/form/util/formUtil';
import { customDataElementValueForKey } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import {
  DeleteExternalFormSubmissionDocument,
  DeleteExternalFormSubmissionMutation,
  DeleteExternalFormSubmissionMutationVariables,
  ExternalFormSubmissionFieldsFragment,
  ExternalFormSubmissionInput,
  ExternalFormSubmissionStatus,
  StaticFormRole,
  UpdateExternalFormSubmissionDocument,
  UpdateExternalFormSubmissionMutation,
  UpdateExternalFormSubmissionMutationVariables,
} from '@/types/gqlTypes';

interface Props extends DialogProps {
  submission: ExternalFormSubmissionFieldsFragment;
}
const ProjectSubmissionsDialog: React.FC<Props> = ({
  submission,
  open = false,
  onClose,
}) => {
  const submissionValues = useMemo(() => {
    const itemMap = getItemMap(submission.definition.definition, true);
    const submissionValues: FormValues = {};
    Object.keys(itemMap).forEach((key) => {
      const pickListOptions = itemMap[key].pickListOptions;
      const value = customDataElementValueForKey(
        key,
        submission.customDataElements
      );
      if (pickListOptions) {
        submissionValues[key] = pickListOptions.find((o) => o.code === value);
      } else {
        submissionValues[key] = value;
      }
    });
    return submissionValues;
  }, [submission.customDataElements, submission.definition.definition]);

  return (
    <CommonDialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Review Submission</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <DynamicView
            values={submissionValues}
            definition={submission.definition.definition}
          />
        </Box>
        <DeleteMutationButton<
          DeleteExternalFormSubmissionMutation,
          DeleteExternalFormSubmissionMutationVariables
        >
          queryDocument={DeleteExternalFormSubmissionDocument}
          variables={{ id: submission.id }}
          idPath={'deleteExternalFormSubmission.externalFormSubmission.id'}
          recordName='Submission'
          onSuccess={() => {
            cache.evict({
              id: `ExternalFormSubmission:${submission.id}`,
            });
            if (onClose) onClose({}, 'escapeKeyDown');
          }}
          ButtonProps={{ sx: { mb: 2 } }}
        >
          Delete this submission
        </DeleteMutationButton>
        <StaticForm<
          UpdateExternalFormSubmissionMutation,
          UpdateExternalFormSubmissionMutationVariables
        >
          role={StaticFormRole.ExternalFormSubmissionReview}
          mutationDocument={UpdateExternalFormSubmissionDocument}
          initialValues={{
            notes: submission.notes,
            reviewed:
              submission.status === ExternalFormSubmissionStatus.Reviewed,
            spam: submission.spam,
          }}
          getVariables={(reviewValues) => {
            return {
              id: submission.id,
              input: {
                notes: reviewValues.notes,
                status: reviewValues.reviewed
                  ? ExternalFormSubmissionStatus.Reviewed
                  : ExternalFormSubmissionStatus.New,
                spam: reviewValues.spam,
              } as ExternalFormSubmissionInput,
            };
          }}
          getErrors={(data) => data.updateExternalFormSubmission?.errors || []}
          onCompleted={(data) => {
            if (!data?.updateExternalFormSubmission?.errors?.length) {
              if (onClose) onClose({}, 'escapeKeyDown');
            }
          }}
          DynamicFormProps={{
            FormActionProps: {
              onDiscard: () => {
                if (onClose) onClose({}, 'escapeKeyDown');
              },
              submitButtonText: 'Save & Close',
              discardButtonText: 'Cancel',
            },
          }}
        />
      </DialogContent>
    </CommonDialog>
  );
};

export default ProjectSubmissionsDialog;
