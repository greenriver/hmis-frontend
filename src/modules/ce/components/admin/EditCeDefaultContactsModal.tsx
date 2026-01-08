import { useMutation } from '@apollo/client';
import {
  Alert,
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { get } from 'lodash-es';
import React, { useCallback, useState } from 'react';
import ButtonLink from '@/components/elements/ButtonLink';
import CommonDialog from '@/components/elements/CommonDialog';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import LoadingButton from '@/components/elements/LoadingButton';
import { ErrorIcon } from '@/components/elements/SemanticIcons';
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
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  AssignCeDefaultContactsDocument,
  AssignCeDefaultContactsMutation,
  AssignCeDefaultContactsMutationVariables,
  CeDefaultContactFieldsFragment,
  CeDefaultContactsBySwimlaneFieldsFragment,
  CeSwimlaneFieldsFragment,
  GetDefaultSwimlaneAssignmentsDocument,
  PickListOption,
  PickListType,
  ProjectWithCeDefaultContactsFragment,
  useGetGlobalDefaultSwimlaneAssignmentsQuery,
  useGetPickListQuery,
  useGetSwimlanesQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  project?: ProjectWithCeDefaultContactsFragment;
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
  project,
  open,
  onClose,
}) => {
  const projectMode = !!project;

  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  // Transform contacts from the backend format to the form state format
  const transformContactsToFormState = useCallback(
    (
      contactsBySwimlane: CeDefaultContactsBySwimlaneFieldsFragment[]
    ): Record<string, PickListOption[]> => {
      const selections: Record<string, PickListOption[]> = {};

      contactsBySwimlane.forEach((item) => {
        selections[item.swimlane.id] = item.contacts.map(
          (contact: CeDefaultContactFieldsFragment) => ({
            code: contact.user.id,
            label: contact.user.name,
            // In project mode, if the `project` owner field is false for this contact,
            // that means it's owned at a higher level, by the org or data source.
            // Show it in the dropdown for clarity, and disable de-selecting it.
            disabled: projectMode ? !contact.project : false,
          })
        );
      });

      return selections;
    },
    [projectMode]
  );

  const [formState, setFormState] = useState<Record<string, PickListOption[]>>(
    // If we were passed a project that already has default contacts loaded, set that as the initial form state.
    // Otherwise, set it to {} and wait for the global contacts query to load.
    projectMode ? transformContactsToFormState(project.ceDefaultContacts) : {}
  );

  // In Global mode, fetch global contacts
  const { loading: globalLoading, error: globalError } =
    useGetGlobalDefaultSwimlaneAssignmentsQuery({
      skip: !open || projectMode, // skip this query in project mode
      onCompleted: (data) => {
        if (data.globalCeDefaultContacts) {
          setFormState(
            transformContactsToFormState(data.globalCeDefaultContacts)
          );
        }
      },
    });

  // In Global mode, fetch global list of swimlanes. (In project mode, use swimlanes already fetched on the project)
  const {
    data: { ceSwimlanes: globalSwimlanes } = {},
    loading: swimlanesLoading,
    error: swimlanesError,
  } = useGetSwimlanesQuery({
    skip: !open || projectMode,
  });
  const ceSwimlanes = project?.ceSwimlanes || globalSwimlanes;

  // Fetch users who are eligible to perform tasks in the specified project.
  // If projectId is null, returns all users who can perform referral tasks in any project.
  const {
    data: { pickList: usersPickList } = {},
    loading: usersLoading,
    error: usersError,
  } = useGetPickListQuery({
    variables: {
      pickListType: PickListType.EligibleReferralStepAssignmentUsers,
      projectId: project?.id,
    },
    skip: !open,
  });
  // todo @martha - treatment for inactive users?

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
    // todo @Martha - probably need to refetch something different when calling this from the project card; maybe pass this in as an argument?
    refetchQueries: [GetDefaultSwimlaneAssignmentsDocument],
    awaitRefetchQueries: true,
  });

  const handleSubmit = useCallback(() => {
    setErrorState(emptyErrorState);

    // Build the contacts array from the form state
    const contacts = Object.entries(formState).map(([swimlaneId, users]) => ({
      swimlaneId,
      // Filter out options marked disabled; these are global contacts,
      // so including them in the submission would cause them to get duplicated at the project level
      userIds: users.filter((u) => !u.disabled).map((u) => u.code),
    }));

    createAssignments({
      variables: {
        input: {
          // pass projectId in project mode. In global mode, when projectId is not passed, the mutation creates contacts that are global (owned by the data source)
          projectId: projectMode ? project?.id : undefined,
          contacts,
        },
      },
    });
  }, [formState, createAssignments, projectMode, project?.id]);

  const getSwimlaneSelect = useCallback(
    (swimlane: CeSwimlaneFieldsFragment) => {
      const isEmpty = !formState[swimlane.id]?.length;
      // Only show Missing warning in project mode,
      // For some swimlanes (like Project Staff) it wouldn't make sense to have a global default.
      const showMissingWarning = isEmpty && projectMode;

      const label = (
        <Stack direction='row' spacing={1} alignItems='center'>
          <span>
            {swimlane.name} ({swimlane.templateName})
          </span>
          {showMissingWarning && (
            <Stack direction='row' spacing={0.5} alignItems='center'>
              <ErrorIcon sx={{ fontSize: 'inherit', color: 'warning.main' }} />
              <span>Missing</span>
            </Stack>
          )}
        </Stack>
      );

      return (
        <Box key={swimlane.id}>
          <FormSelect
            label={label}
            value={formState[swimlane.id] || []}
            options={usersPickList || []}
            onChange={(_, value) => handleChangeUsers(swimlane.id, value)}
            multiple
            placeholder='Select'
            helperText={`Tasks: ${swimlane.taskNames.join(', ')}`}
            color={showMissingWarning ? 'warning' : undefined}
          />
        </Box>
      );
    },
    [formState, handleChangeUsers, projectMode, usersPickList]
  );

  const loading = globalLoading || swimlanesLoading || usersLoading;
  const error = globalError || swimlanesError || usersError;

  if (error) throw error;

  const hasSwimlanes = !!ceSwimlanes?.length;

  return (
    <CommonDialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>
        Edit {projectMode ? 'Project' : 'Global'} Contacts
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Loading />
        ) : (
          <Stack spacing={3} sx={{ mt: 2 }}>
            {projectMode && (
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

            {ceSwimlanes?.map((swimlane) => getSwimlaneSelect(swimlane))}

            {!hasSwimlanes && (
              <Alert severity='info'>
                This project does not have any unit groups that are using
                Coordinated Entry referral workflows.
              </Alert>
            )}

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
          {(loading || hasSwimlanes) && (
            <LoadingButton
              onClick={handleSubmit}
              type='submit'
              loading={submitLoading}
              disabled={loading || submitLoading}
            >
              Save
            </LoadingButton>
          )}
          {!loading && !hasSwimlanes && (
            <ButtonLink
              to={generateSafePath(ProjectDashboardRoutes.UNITS, {
                projectId: project?.id,
              })}
            >
              View Project Units
            </ButtonLink>
          )}
        </Stack>
      </DialogActions>
    </CommonDialog>
  );
};

export default EditCeDefaultContactsModal;
