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
import React, { useCallback, useState } from 'react';
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
  CeDefaultContactsBySwimlaneFieldsFragment,
  GetDefaultSwimlaneAssignmentsDocument,
  PickListOption,
  PickListType,
  useGetGlobalDefaultSwimlaneAssignmentsQuery,
  useGetPickListQuery,
  useGetProjectDefaultSwimlaneAssignmentsQuery,
  useGetSwimlanesQuery,
} from '@/types/gqlTypes';

interface Props {
  projectId?: string;
  open: boolean;
  onClose: () => void;
}

/**
 * This modal supports editing Coordinated Entry default contacts, in 2 modes:
 * - Project: When a projectId is passed, it edits contacts for that project.
 * - Global: When no projectId is passed, it edits global contacts.
 *
 * Contacts can be owned by other entities (org and unit group),
 * but the frontend does not support editing contacts at those levels.
 */
const EditCeDefaultContactsModal: React.FC<Props> = ({
  projectId,
  open,
  onClose,
}) => {
  // todo @martha - needs not applicable and missing treatments
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  const [formState, setFormState] = useState<Record<string, PickListOption[]>>(
    {}
  );

  // Fetch swimlanes
  // todo @martha - needs to be fetch swimlanes applicable to this project, if project is passed
  const {
    data: { ceSwimlanes } = {},
    loading: swimlanesLoading,
    error: swimlanesError,
  } = useGetSwimlanesQuery({
    skip: !open,
  });

  // Populate form state from existing contacts
  const populateFormState = useCallback(
    (contactsBySwimlane: CeDefaultContactsBySwimlaneFieldsFragment[]) => {
      const selections: Record<string, PickListOption[]> = {};

      contactsBySwimlane.forEach((item) => {
        selections[item.swimlane.id] = item.contacts.map((contact: any) => ({
          code: contact.user.id,
          label: contact.user.name,
        }));
      });

      setFormState(selections);
    },
    []
  );

  // In Project mode, fetch existing project contacts
  const {
    data: { project } = {},
    loading: projectLoading,
    error: projectError,
  } = useGetProjectDefaultSwimlaneAssignmentsQuery({
    variables: { id: projectId || '' },
    skip: !open || !projectId, // skip the query if no project id (global mode)
    onCompleted: (data) => {
      if (data.project?.ceDefaultContacts) {
        // todo @martha - bug: this includes contacts owned at other levels, which causes duplication
        populateFormState(data.project.ceDefaultContacts);
      }
    },
  });

  // In Global mode, fetch existing global contacts
  const { loading: globalLoading, error: globalError } =
    useGetGlobalDefaultSwimlaneAssignmentsQuery({
      skip: !open || !!projectId, // skip this query in project mode
      onCompleted: (data) => {
        if (data.globalCeDefaultContacts) {
          populateFormState(data.globalCeDefaultContacts);
        }
      },
    });

  // Fetch users who are eligible to perform tasks in the specified project
  // todo @martha - this returns empty in global mode
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

  const handleChangeUsers = useCallback(
    (swimlaneId: string, users: PickListOption[]) => {
      setFormState((prev) => ({
        ...prev,
        [swimlaneId]: users,
      }));
    },
    []
  );

  const handleClose = useCallback(() => {
    setErrorState(emptyErrorState);
    setFormState({});
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
        handleClose();
      }
    },
    onError: (apolloError) => {
      setErrorState({ ...emptyErrorState, apolloError });
    },
    // After completing the mutation, refetch the query for all default contacts
    // todo @Martha - probably need to refetch something different when calling this from the project card
    refetchQueries: [GetDefaultSwimlaneAssignmentsDocument],
    awaitRefetchQueries: true,
  });

  const handleSubmit = useCallback(() => {
    setErrorState(emptyErrorState);

    // Build the contacts array from the form state
    const contacts = Object.entries(formState).map(([swimlaneId, users]) => ({
      swimlaneId,
      userIds: users.map((u) => u.code),
    }));

    createAssignments({
      variables: {
        input: {
          projectId: projectId || null, // if projectId is null, the default contact created is global
          contacts,
        },
      },
    });
  }, [projectId, formState, createAssignments]);

  const loading =
    projectLoading || globalLoading || swimlanesLoading || usersLoading;
  const error = projectError || globalError || swimlanesError || usersError;

  if (error) throw error;

  // const isDataLoaded = !loading && ceSwimlanes && usersPickList;

  return (
    <CommonDialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>
        Edit {projectId ? 'Project' : 'Global'} Contacts
      </DialogTitle>
      <DialogContent>
        {loading ? (
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

            {ceSwimlanes?.map((swimlane) => (
              <Box key={swimlane.id}>
                <FormSelect
                  label={`${swimlane.name} (${swimlane.templateName})`}
                  value={formState[swimlane.id] || []}
                  options={usersPickList || []}
                  onChange={(_, value) =>
                    handleChangeUsers(swimlane.id, value as PickListOption[])
                  }
                  multiple
                  placeholder='Select'
                />
              </Box>
            ))}

            {/* todo @martha - test both validation and apollo errors */}
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
          >
            Cancel
          </Button>
          <LoadingButton
            onClick={handleSubmit}
            type='submit'
            loading={submitLoading}
            disabled={loading || submitLoading}
          >
            Save
          </LoadingButton>
        </Stack>
      </DialogActions>
    </CommonDialog>
  );
};

export default EditCeDefaultContactsModal;
