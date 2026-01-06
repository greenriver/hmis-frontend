import { useMutation } from '@apollo/client';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { get } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CommonDialog from '@/components/elements/CommonDialog';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import LoadingButton from '@/components/elements/LoadingButton';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import WarningAlert from '@/modules/errors/components/WarningAlert';
import {
  emptyErrorState,
  ErrorState,
  hasAnyValue,
  partitionValidations,
} from '@/modules/errors/util';
import FormSelect from '@/modules/form/components/FormSelect';
import {
  AssignCeDefaultContactsDocument,
  AssignCeDefaultContactsMutation,
  AssignCeDefaultContactsMutationVariables,
  GetDefaultSwimlaneAssignmentsDocument,
  PickListOption,
  PickListType,
  useGetPickListQuery,
  useGetProjectDefaultSwimlaneAssignmentsQuery,
  useGetSwimlanesQuery,
} from '@/types/gqlTypes';

interface Props {
  projectId?: string;
  open: boolean;
  onClose: () => void;
}

const EditCeDefaultContactsModal: React.FC<Props> = ({
  projectId,
  open,
  onClose,
}) => {
  // Error state for validation errors
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  // Fetch swimlanes
  // todo @martha - needs to be fetch swimlanes applicable to this project
  const {
    data: { ceSwimlanes } = {},
    loading: swimlanesLoading,
    error: swimlanesError,
  } = useGetSwimlanesQuery({
    skip: !open,
  });

  // Fetch existing project default assignments
  const {
    data: projectData,
    loading: projectLoading,
    error: projectError,
  } = useGetProjectDefaultSwimlaneAssignmentsQuery({
    variables: { id: projectId || '' },
    skip: !open || !projectId,
  });

  const project = projectData?.project;

  // Fetch users who are eligible to perform tasks in the specified project
  // todo @martha - this will return empty when project is not passed
  const {
    data: { pickList: usersPickList } = {},
    loading: usersLoading,
    error: usersError,
  } = useGetPickListQuery({
    variables: {
      pickListType: PickListType.EligibleReferralStepAssignmentUsers,
      projectId: projectId,
    },
    skip: !open,
  });

  // Compute initial values from project data
  const initialSelectedUsers = useMemo(() => {
    if (!project || !ceSwimlanes) return {};

    const selections: Record<string, PickListOption[]> = {};

    ceSwimlanes.forEach((swimlane) => {
      const assignment = project.defaultSwimlaneAssignments.find(
        (a) => a.swimlane.id === swimlane.id
      );

      if (assignment) {
        selections[swimlane.id] = assignment.assignments.map((a) => ({
          code: a.user.id,
          label: a.user.name,
        }));
      } else {
        selections[swimlane.id] = [];
      }
    });

    return selections;
  }, [project, ceSwimlanes]);

  // Form state
  const [selectedUsers, setSelectedUsers] = useState<
    Record<string, PickListOption[]>
  >({});

  // Update form state when initial values change
  useEffect(() => {
    if (Object.keys(initialSelectedUsers).length > 0) {
      setSelectedUsers(initialSelectedUsers);
    }
  }, [initialSelectedUsers]);

  const handleChangeUsers = useCallback(
    (swimlaneId: string, users: PickListOption[]) => {
      setSelectedUsers((prev) => ({
        ...prev,
        [swimlaneId]: users,
      }));
    },
    []
  );

  const handleClose = useCallback(() => {
    setErrorState(emptyErrorState);
    setSelectedUsers({});
    onClose();
  }, [onClose]);

  // Mutation to update default swimlane assignments
  const [createAssignments, { loading: submitLoading }] = useMutation<
    AssignCeDefaultContactsMutation,
    AssignCeDefaultContactsMutationVariables
  >(AssignCeDefaultContactsDocument, {
    onCompleted: (result) => {
      const errors = get(result, ['assignCeDefaultContacts', 'errors']) || [];
      if (errors.length > 0) {
        setErrorState(partitionValidations(errors));
      } else {
        // Success - close the modal and reset state
        handleClose();
      }
    },
    onError: (apolloError) => {
      setErrorState({ ...emptyErrorState, apolloError });
    },
    refetchQueries: [GetDefaultSwimlaneAssignmentsDocument],
    awaitRefetchQueries: true,
  });

  const handleSubmit = useCallback(() => {
    // Clear previous errors
    setErrorState(emptyErrorState);

    // Build the assignments array from the form state
    const assignments = Object.entries(selectedUsers).map(
      ([swimlaneId, users]) => ({
        swimlaneId,
        userIds: users.map((u) => u.code),
      })
    );

    // Call the mutation
    createAssignments({
      variables: {
        input: {
          projectId: projectId || null,
          assignments,
        },
      },
    });
  }, [projectId, selectedUsers, createAssignments]);

  const loading = projectLoading || swimlanesLoading || usersLoading;
  const error = projectError || swimlanesError || usersError;

  if (error) throw error;

  const isDataLoaded = !loading && ceSwimlanes && usersPickList;

  return (
    <CommonDialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>
        Edit {projectId ? 'Project' : 'Global'} Contacts
      </DialogTitle>
      <DialogContent>
        {!isDataLoaded ? (
          <Loading />
        ) : (
          <Stack spacing={3} sx={{ mt: 2 }}>
            {project && (
              <Box>
                <Stack direction='row' spacing={4}>
                  <CommonLabeledTextBlock title='Project'>
                    {project.projectName}
                  </CommonLabeledTextBlock>
                  <CommonLabeledTextBlock title='Organization'>
                    {project.organization.organizationName}
                  </CommonLabeledTextBlock>
                </Stack>
              </Box>
            )}

            {/*todo @martha - cecelia impersonator is getting duplicated because she is the global contact, need to update those so they are greyed out and not submitted as part of the input*/}
            {/* Swimlane Assignments */}
            {ceSwimlanes?.map((swimlane) => (
              <Box key={swimlane.id}>
                <FormSelect
                  label={`${swimlane.name} (${swimlane.templateName})`}
                  value={selectedUsers[swimlane.id] || []}
                  options={usersPickList || []}
                  onChange={(_, value) =>
                    handleChangeUsers(swimlane.id, value as PickListOption[])
                  }
                  multiple
                  placeholder='Select'
                />
              </Box>
            ))}

            {/* Display validation errors */}
            {hasAnyValue(errorState) && (
              <Stack gap={1}>
                <ApolloErrorAlert error={errorState.apolloError} />
                <ErrorAlert errors={errorState.errors} />
                <WarningAlert warnings={errorState.warnings} />
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Stack gap={3} direction='row'>
          <Button
            onClick={handleClose}
            color='grayscale'
            disabled={submitLoading}
            data-testid='cancelDialogAction'
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleSubmit}
            type='submit'
            loading={submitLoading}
            disabled={loading}
            data-testid='confirmDialogAction'
            sx={{ minWidth: '120px' }}
          >
            Save
          </LoadingButton>
        </Stack>
      </DialogActions>
    </CommonDialog>
  );
};

export default EditCeDefaultContactsModal;
