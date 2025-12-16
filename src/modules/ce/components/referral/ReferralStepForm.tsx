import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSafeParams from '@/hooks/useSafeParams';
import { useReferralContext } from '@/modules/ce/components/referral/ReferralPage';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import DynamicForm from '@/modules/form/components/DynamicForm';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import useInitialFormValues from '@/modules/form/hooks/useInitialFormValues';
import { FormActionTypes } from '@/modules/form/types';
import { getItemMap } from '@/modules/form/util/formUtil';
import {
  CeReferralStatus,
  CeReferralStepFieldsFragment,
  CeReferralStepStatus,
  useSubmitCeReferralStepMutation,
} from '@/types/gqlTypes';

interface Props {
  step: CeReferralStepFieldsFragment;
}

/**
 * Render Referral Step (Task) as a DynamicForm or DynamicView
 */
const ReferralStepForm: React.FC<Props> = ({ step }) => {
  const { referralId, stepId } = useSafeParams() as {
    referralId: string;
    stepId: string;
  };
  const { referral, referralPath } = useReferralContext();
  const navigate = useNavigate();

  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);

  const [submit, { loading: submitLoading }] = useSubmitCeReferralStepMutation({
    onCompleted: (data) => {
      const errors = data.submitCeReferralStep?.errors;
      if (errors && errors.length > 0) {
        setErrors(partitionValidations(errors));
        return;
      }

      setErrors(emptyErrorState);

      const status = data.submitCeReferralStep?.referral?.status;
      const wayfind =
        status &&
        [CeReferralStatus.Rejected, CeReferralStatus.Accepted].includes(status);

      navigate({
        pathname: referralPath,
        search: wayfind
          ? new URLSearchParams({ wayfinding: 'true' }).toString()
          : undefined,
      });
    },
    onError: (apolloError) => {
      setErrors({ ...emptyErrorState, apolloError });
    },
  });

  const { status, formDefinition } = step || {};

  const itemMap = useMemo(
    () => formDefinition && getItemMap(formDefinition.definition),
    [formDefinition]
  );

  // Display form values based on the Step record (CustomDataElements) rather than the submittedValues field, to be consistent with other form behavior throughout the application.
  const initialValues = useInitialFormValues({
    record: step,
    itemMap,
    definition: formDefinition?.definition,
    localConstants: { projectId: referral.opportunity?.projectId },
  });

  const editable =
    status === CeReferralStepStatus.InProgress && step?.access.canPerformStep;

  return (
    <>
      {editable ? (
        <DynamicForm
          variant='without_top_level_cards'
          definition={formDefinition.definition}
          onSubmit={({ valuesByLinkId, valuesByFieldName, confirmed }) => {
            submit({
              variables: {
                referralId: referralId,
                stepId: stepId,
                valuesByLinkId,
                valuesByFieldName,
                formDefinitionId: formDefinition.id,
                confirmed,
              },
            });
          }}
          errors={errors}
          loading={submitLoading}
          FormActionProps={{
            config: [
              {
                id: 'submit',
                label: 'Submit',
                action: FormActionTypes.Submit,
                buttonProps: { variant: 'contained' },
              },
            ],
          }}
          initialValues={initialValues}
        />
      ) : (
        <DynamicView
          definition={formDefinition.definition}
          values={initialValues}
          variant={'without_top_level_cards'}
        />
      )}
    </>
  );
};

export default ReferralStepForm;
