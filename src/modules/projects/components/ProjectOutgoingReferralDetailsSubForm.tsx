import { Alert } from '@mui/material';
import { Box } from '@mui/system';
import { useMemo } from 'react';

import LoadingSkeleton from '@/components/elements/LoadingSkeleton';
import DynamicForm from '@/modules/form/components/DynamicForm';
import { useDynamicFormHandlersForRecord } from '@/modules/form/hooks/useDynamicFormHandlersForRecord';
import useFormDefinition from '@/modules/form/hooks/useFormDefinition';
import { SubmitFormAllowedTypes } from '@/modules/form/types';
import { AlwaysPresentLocalConstants } from '@/modules/form/util/formUtil';
import {
  RecordFormRole,
  useGetProjectCanAcceptReferralQuery,
} from '@/types/gqlTypes';

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

  const { data } = useGetProjectCanAcceptReferralQuery({
    variables: {
      destinationProjectId: destinationProjectId,
      sourceEnrollmentId: enrollmentId,
    },
  });

  return (
    <Box>
      {formDefinitionLoading && (
        <LoadingSkeleton width={'100%'} count={1} sx={{ my: 2 }} />
      )}
      {data && !data.projectCanAcceptReferral && (
        <Alert severity='warning' sx={{ mb: 2 }}>
          At least one client in the household already has an open enrollment in
          this project.
        </Alert>
      )}
      {formDefinition && (
        <DynamicForm
          definition={formDefinition.definition}
          onSubmit={onSubmit}
          initialValues={initialValues}
          loading={submitLoading}
          // validation errors are rendered above the form
          errors={errors}
          localConstants={localConstants}
          pickListArgs={{ projectId: destinationProjectId }}
          variant='without_top_level_cards'
          FormActionProps={{
            submitButtonText: 'Refer Household',
            discardButtonText: 'Cancel',
          }}
        />
      )}
    </Box>
  );
};

export default ProjectOutgoingReferralDetailsSubForm;
