import { Box, Stack } from '@mui/system';
import { useMemo, useState } from 'react';

import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import { hasAnyValue } from '@/modules/errors/util';
import DynamicField from '@/modules/form/components/DynamicField';
import DynamicForm from '@/modules/form/components/DynamicForm';
import { useDynamicFormHandlersForRecord } from '@/modules/form/hooks/useDynamicFormHandlersForRecord';
import useFormDefinition from '@/modules/form/hooks/useFormDefinition';
import { itemDefaults } from '@/modules/form/util/formUtil';
import {
  ItemType,
  PickListOption,
  PickListType,
  ProjectAllFieldsFragment,
  RecordFormRole,
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
  const { formDefinition } = useFormDefinition({
    role: RecordFormRole.Referral,
    // form selection is based on the receiving proeject
    projectId: formState.selectedProject?.code,
  });

  const hookArgs = useMemo(() => {
    // const localConstants = {
    //   errorRef,
    //   hudRecordType: serviceType?.hudRecordType,
    //   hudTypeProvided: serviceType?.hudTypeProvided,
    //   entryDate: enrollment?.entryDate,
    //   exitDate: enrollment?.exitDate,
    //   ...AlwaysPresentLocalConstants,
    // };
    return {
      formDefinition,
      record: {},
      // localConstants,
      inputVariables: {
        projectId: formState.selectedProject?.code,
        enrollmentId: formState?.selectedEnrollment?.code,
      },
      onCompleted: () => {
        onComplete();
        // cache.evict({
        //   id: `Enrollment:${enrollmentId}`,
        //   fieldName: 'services',
        // });
        // setFormState({});
        // setDialogOpen(false);
        // onClose();
      },
    };
  }, [
    formState,
    formDefinition,
    onComplete,
    // service,
    // enrollmentId,
    // enrollment,
    // onClose,
  ]);

  const { initialValues, errors, onSubmit, submitLoading } =
    useDynamicFormHandlersForRecord(hookArgs);

  const pickListArgsForEnrollmentPicker = useMemo(
    () => ({ projectId: project.id }),
    [project]
  );

  // Note: we're not using DynamicForm here because of the need to use separate "pick list args"
  // for different elements based on selection: the unit type pick list depends on which project
  // is chosen. If DynamicForm is updated to support that, we could switch back to using it here.
  return (
    <Box>
      {errors && hasAnyValue(errors) && (
        <Stack gap={1} sx={{ mt: 4 }}>
          <ApolloErrorAlert error={errors.apolloError} />
          {/* <ErrorAlert key='errors' errors={errors.errors} /> */}
        </Stack>
      )}
      <Stack gap={2}>
        <DynamicField
          value={formState.selectedEnrollment}
          item={{
            ...itemDefaults,
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
            ...itemDefaults,
            type: ItemType.Choice,
            required: true,
            linkId: 'project',
            text: 'Project',
            pickListReference: PickListType.OpenProjects,
          }}
          itemChanged={({ value }) =>
            setFormState((old) => ({
              ...old,
              selectedProject: value,
              selectedUnitType: undefined,
            }))
          }
        />

        {formState.selectedProject && formDefinition && (
          <Box
            // unset top-level card styling for form sections
            sx={{ '.HmisForm-card': { px: 0, pt: 1, pb: 0, border: 'unset' } }}
          >
            <DynamicForm
              key={formState.selectedProject?.code}
              definition={formDefinition.definition}
              onSubmit={onSubmit}
              initialValues={initialValues}
              loading={submitLoading}
              errors={errors}
              // ref={formRef}
              // {...props}
              pickListArgs={{ projectId: formState.selectedProject?.code }}
              FormActionProps={{
                submitButtonText: 'Refer Household',
                discardButtonText: 'Cancel',
              }}
              // hideSubmit
              // errorRef={errorRef}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default ProjectOutgoingReferralForm;
