import { DocumentNode, useMutation } from '@apollo/client';
import {
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
import LoadingButton from '@/components/elements/LoadingButton';
import ProjectNoSwimlanesAlert from '@/modules/ce/components/defaultContacts/ProjectNoSwimlanesAlert';
import SwimlaneUserSelect from '@/modules/ce/components/defaultContacts/SwimlaneUserSelect';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import WarningAlert from '@/modules/errors/components/WarningAlert';
import {
  emptyErrorState,
  ErrorState,
  hasAnyValue,
  partitionValidations,
} from '@/modules/errors/util';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  AssignCeDefaultContactsDocument,
  AssignCeDefaultContactsMutation,
  AssignCeDefaultContactsMutationVariables,
  CeDefaultContactFieldsFragment,
  CeDefaultContactsBySwimlaneFieldsFragment,
  CeSwimlaneFieldsFragment,
  GetDefaultContactsDocument,
  PickListOption,
  PickListType,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  ceSwimlanes: CeSwimlaneFieldsFragment[]; // All swimlanes to be edited (one record per swimlane)
  initialValue: CeDefaultContactsBySwimlaneFieldsFragment[]; // Initial swimlane assignments (one record per swimlane that has any assignments)
  projectId?: string; // If passed, manage default contacts for the specific project. If not passed, manage global contacts.
  open: boolean;
  onClose: () => void;
  title: string;
  dialogContentHeader?: React.ReactNode;
  awaitRefetchQueriesOnSuccess?: DocumentNode[]; // queries to await refetch after mutation succeeds
}

/**
 * This modal is used internally by EditProjectCeDefaultContactsModal and EditGlobalCeDefaultContactsModal
 * to abstract their shared functionality.
 * Contacts can be owned by other entities (org and unit group),
 * but the frontend does not yet support editing contacts at those levels.
 */
const EditCeDefaultContactsModal: React.FC<Props> = ({
  ceSwimlanes,
  initialValue,
  projectId,
  open,
  onClose,
  title,
  dialogContentHeader,
  awaitRefetchQueriesOnSuccess = [],
}) => {
  const projectMode = !!projectId;

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
            // For inactive users, add "(Inactive)" to the label.
            // Inactive users won't appear in the dropdown anyway,
            // so this doesn't create a mismatch between the form state and the picklist options.
            label: `${contact.user.name}${contact.user.active ? '' : ' (Inactive)'}`,
            // In project mode, if the `project` owner field is false for this contact,
            // that means it's owned at a higher level, by the org or data source.
            // Show it in the dropdown for clarity, and disable de-selecting it.
            disabled: projectMode ? !contact.projectId : false,
          })
        );
      });

      return selections;
    },
    [projectMode]
  );

  const [formState, setFormState] = useState<Record<string, PickListOption[]>>(
    transformContactsToFormState(initialValue)
  );
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
    refetchQueries: [
      GetDefaultContactsDocument,
      ...awaitRefetchQueriesOnSuccess,
    ],
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
          projectId,
          contacts,
        },
      },
    });
  }, [formState, createAssignments, projectId]);

  const hasSwimlanes = !!ceSwimlanes?.length;

  return (
    <CommonDialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {dialogContentHeader}

          {ceSwimlanes?.map((swimlane) => (
            <SwimlaneUserSelect
              key={swimlane.id}
              value={formState[swimlane.id] || []}
              onChange={(value) => handleChangeUsers(swimlane.id, value)}
              warnIfEmpty={projectMode}
              pickListArgs={{
                pickListType: PickListType.EligibleReferralStepAssignmentUsers,
                projectId,
              }}
              swimlane={swimlane}
            />
          ))}

          {!hasSwimlanes && <ProjectNoSwimlanesAlert />}

          {hasAnyValue(errorState) && (
            <Stack gap={1}>
              <ApolloErrorAlert error={errorState.apolloError} />
              <ErrorAlert errors={errorState.errors} />
              <WarningAlert warnings={errorState.warnings} />
            </Stack>
          )}
        </Stack>
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
          {hasSwimlanes && (
            <LoadingButton
              onClick={handleSubmit}
              type='submit'
              loading={submitLoading}
              disabled={submitLoading}
            >
              Save
            </LoadingButton>
          )}
          {!hasSwimlanes && projectId && (
            <ButtonLink
              to={generateSafePath(ProjectDashboardRoutes.UNITS, {
                projectId,
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
