import { Box } from '@mui/system';
import { useMemo } from 'react';

import LoadingSkeleton from '@/components/elements/LoadingSkeleton';
import DynamicForm from '@/modules/form/components/DynamicForm';
import { useDynamicFormHandlersForRecord } from '@/modules/form/hooks/useDynamicFormHandlersForRecord';
import useFormDefinition from '@/modules/form/hooks/useFormDefinition';
import { SubmitFormAllowedTypes } from '@/modules/form/types';
import { AlwaysPresentLocalConstants } from '@/modules/form/util/formUtil';
import { RecordFormRole } from '@/types/gqlTypes';

interface Props {
  enrollmentId: string; // HoH enrollment that is being referred
  destinationProjectId: string; // project being referred to
  onSuccess: VoidFunction;
}

/**
 * Renders a dynamic form for collecting additional referral details
 * based on the receiving project
 */
const ProjectOutgoingReferralDetailsSubForm: React.FC<Props> = ({
  destinationProjectId,
  enrollmentId,
  onSuccess,
}) => {
  const { formDefinition, loading: formDefinitionLoading } = useFormDefinition({
    role: RecordFormRole.Referral,
    // form selection is based on the project that is being referred to
    projectId: destinationProjectId,
  });
  const localConstants = useMemo(
    () => ({
      projectId: destinationProjectId,
      ...AlwaysPresentLocalConstants,
    }),
    [destinationProjectId]
  );
  const hookArgs = useMemo(() => {
    return {
      formDefinition,
      record: {} as SubmitFormAllowedTypes,
      inputVariables: {
        projectId: destinationProjectId,
        enrollmentId,
      },
      onCompleted: () => onSuccess(),
    };
  }, [formDefinition, destinationProjectId, enrollmentId, onSuccess]);

  const { initialValues, errors, onSubmit, submitLoading } =
    useDynamicFormHandlersForRecord(hookArgs);

  if (!formDefinitionLoading && !formDefinition) {
    throw new Error(
      `Failed to find referral form definition for project ${destinationProjectId}`
    );
  }

  return (
    <Box>
      {formDefinitionLoading && (
        <LoadingSkeleton width={500} count={1} sx={{ my: 2 }} />
      )}
      {formDefinition && (
        <Box
          // unset top-level card styling for form sections
          sx={{ '.HmisForm-card': { px: 0, pt: 1, pb: 0, border: 'unset' } }}
        >
          <DynamicForm
            definition={formDefinition.definition}
            onSubmit={onSubmit}
            initialValues={initialValues}
            loading={submitLoading}
            // validation errors are rendered above the form
            errors={errors}
            localConstants={localConstants}
            pickListArgs={{ projectId: destinationProjectId }}
            FormActionProps={{
              submitButtonText: 'Refer Household',
              discardButtonText: 'Cancel',
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ProjectOutgoingReferralDetailsSubForm;
