import { LoadingButton } from '@mui/lab';
import { Box, Stack } from '@mui/system';
import { useCallback, useMemo, useState } from 'react';

import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import {
  emptyErrorState,
  hasAnyValue,
  partitionValidations,
} from '@/modules/errors/util';
import DynamicField from '@/modules/form/components/DynamicField';
import {
  ItemType,
  PickListOption,
  PickListType,
  ProjectAllFieldsFragment,
  useCreateOutgoingReferralPostingMutation,
} from '@/types/gqlTypes';

interface Props {
  project: ProjectAllFieldsFragment;
  onComplete: VoidFunction;
}

type FormState = {
  selectedEnrollment?: PickListOption;
  selectedProject?: PickListOption;
  selectedUnitType?: PickListOption;
  note?: string;
};

const ProjectOutgoingReferralForm: React.FC<Props> = ({
  project,
  onComplete,
}) => {
  const [formState, setFormState] = useState<FormState>({});
  const [errors, setErrors] = useState(emptyErrorState);
  const [mutate, { loading }] = useCreateOutgoingReferralPostingMutation({
    onCompleted: (data) => {
      const { errors: remoteErrors = [] } =
        data.createOutgoingReferralPosting || {};
      if (remoteErrors.length) {
        setErrors(partitionValidations(remoteErrors));
      } else {
        onComplete();
      }
    },
    onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
  });

  const pickListArgsForEnrollmentPicker = useMemo(
    () => ({ projectId: project.id }),
    [project]
  );
  const pickListArgsForUnitPicker = useMemo(
    () => ({ projectId: formState.selectedProject?.code }),
    [formState]
  );

  const handleSubmit = useCallback(() => {
    setErrors(emptyErrorState);
    mutate({
      variables: {
        input: {
          enrollmentId: formState.selectedEnrollment?.code,
          projectId: formState.selectedProject?.code,
          unitTypeId: formState.selectedUnitType?.code,
          note: formState.note,
        },
      },
    });
  }, [mutate, formState]);

  // Note: we're not using DynamicForm here because of the need to use separate "pick list args"
  // for different elements based on selection: the unit type pick list depends on which project
  // is chosen. If DynamicForm is updated to support that, we could switch back to using it here.
  return (
    <Box>
      {errors && hasAnyValue(errors) && (
        <Stack gap={1} sx={{ mt: 4 }}>
          <ApolloErrorAlert error={errors.apolloError} />
          <ErrorAlert key='errors' errors={errors.errors} />
        </Stack>
      )}
      <Stack gap={2}>
        <DynamicField
          value={formState.selectedEnrollment}
          item={{
            type: ItemType.Choice,
            required: true,
            linkId: 'enrollment',
            text: 'HoH Enrollment',
            pickListReference: PickListType.OpenHohEnrollmentsForProject,
          }}
          pickListArgs={pickListArgsForEnrollmentPicker}
          itemChanged={({ value }) =>
            setFormState((old) => ({ ...old, selectedEnrollment: value }))
          }
        />
        <DynamicField
          value={formState.selectedProject}
          item={{
            type: ItemType.Choice,
            required: true,
            linkId: 'project',
            text: 'Project',
            pickListReference: PickListType.Project,
          }}
          itemChanged={({ value }) =>
            setFormState((old) => ({
              ...old,
              selectedProject: value,
              selectedUnitType: undefined,
            }))
          }
        />
        {formState.selectedProject && (
          <DynamicField
            value={formState.selectedUnitType}
            item={{
              type: ItemType.Choice,
              required: true,
              linkId: 'unitType',
              text: 'Unit Type',
              pickListReference: PickListType.AvailableUnitTypes,
            }}
            pickListArgs={pickListArgsForUnitPicker}
            itemChanged={({ value }) =>
              setFormState((old) => ({ ...old, selectedUnitType: value }))
            }
          />
        )}
        <DynamicField
          value={formState.note}
          item={{
            type: ItemType.Text,
            linkId: 'note',
            text: 'Service Coordinator Note',
          }}
          itemChanged={({ value }) =>
            setFormState((old) => ({ ...old, note: value }))
          }
        />
      </Stack>
      <LoadingButton
        type='submit'
        variant='contained'
        color='primary'
        sx={{ mt: 3, mb: 2 }}
        loading={loading}
        onClick={handleSubmit}
        disabled={
          !formState.selectedEnrollment ||
          !formState.selectedProject ||
          !formState.selectedUnitType
        }
      >
        Refer Household
      </LoadingButton>
    </Box>
  );
};

export default ProjectOutgoingReferralForm;
