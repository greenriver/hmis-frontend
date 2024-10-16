import {
  Alert,
  Card,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import TextInput from '@/components/elements/input/TextInput';
import Loading from '@/components/elements/Loading';
import RouterLink from '@/components/elements/RouterLink';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import FormDialogActionContent from '@/modules/form/components/FormDialogActionContent';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import { FormValues } from '@/modules/form/types';
import { getItemMap, getOptionValue } from '@/modules/form/util/formUtil';
import { cache } from '@/providers/apolloClient';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  DeleteExternalFormSubmissionDocument,
  DeleteExternalFormSubmissionMutation,
  DeleteExternalFormSubmissionMutationVariables,
  ExternalFormSubmissionFieldsFragment,
  ExternalFormSubmissionInput,
  ExternalFormSubmissionStatus,
  useGetExternalFormSubmissionQuery,
  useUpdateExternalFormSubmissionMutation,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const ExternalSubmissionsModalContent = ({
  submission,
  onClose,
}: {
  submission: ExternalFormSubmissionFieldsFragment;
  onClose: VoidFunction;
}) => {
  const submissionValues = useMemo(() => {
    const itemMap = getItemMap(submission.definition.definition, true);
    const submissionValues: FormValues = {};
    Object.entries(itemMap).forEach(([key, item]) => {
      const { customFieldKey, recordType, fieldName } = item.mapping || {};
      const recordAttrKey =
        recordType && fieldName
          ? `${HmisEnums.RelatedRecordType[recordType]}.${fieldName}`
          : '';

      if (!customFieldKey && !recordAttrKey) return;

      const value = customFieldKey
        ? submission.values[customFieldKey]
        : submission.values[recordAttrKey];

      // if item has a picklist, convert value to PickListOption(s) so we can display the readable label
      if (item.pickListOptions || item.pickListReference) {
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
  }, [submission]);

  const [notes, setNotes] = useState(submission.notes || '');
  const [status, setStatus] = useState(
    submission.status || ExternalFormSubmissionStatus.New
  );
  const [spam, setSpam] = useState(submission.spam || false);

  const [updateSubmission, { loading, error }] =
    useUpdateExternalFormSubmissionMutation({
      variables: {
        id: submission.id,
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

  const deleteButton = useMemo(
    () =>
      submission.status === ExternalFormSubmissionStatus.New && (
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
            onClose();
          }}
          onlyIcon
        />
      ),
    [onClose, submission]
  );

  if (error) throw error;

  return (
    <>
      <DialogContent>
        <Stack gap={2} sx={{ my: 2 }}>
          {submission.enrollmentId && submission.clientId && (
            <Alert severity='success'>
              <Typography variant='body2'>
                This form submission is linked to{' '}
                <RouterLink
                  to={generateSafePath(
                    EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
                    {
                      clientId: submission.clientId,
                      enrollmentId: submission.enrollmentId,
                    }
                  )}
                  openInNew
                >
                  Enrollment {submission.enrollmentId}
                </RouterLink>
              </Typography>
            </Alert>
          )}
          <Card sx={{ p: 2 }}>
            <DynamicView
              values={submissionValues}
              definition={submission.definition.definition}
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
            {submission.status === ExternalFormSubmissionStatus.New && (
              <>
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
              </>
            )}
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
    </>
  );
};

const ExternalSubmissionsViewModal = ({
  submissionId,
  onClose,
}: {
  submissionId: string;
  onClose: VoidFunction;
}) => {
  const {
    data: { externalFormSubmission: submission } = {},
    loading: loading,
    error: error,
  } = useGetExternalFormSubmissionQuery({
    variables: {
      id: submissionId,
    },
  });

  if (error) throw error;

  return (
    <CommonDialog open={!!submissionId} fullWidth onClose={onClose}>
      <DialogTitle>Submission {submissionId}</DialogTitle>
      {loading && (
        <DialogContent>
          <Loading />
        </DialogContent>
      )}
      {submission && (
        <ExternalSubmissionsModalContent
          submission={submission}
          onClose={onClose}
        />
      )}
    </CommonDialog>
  );
};

export default ExternalSubmissionsViewModal;
