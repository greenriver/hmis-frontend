import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotFound from '@/components/pages/NotFound';
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
 * Renders a form for a completing or viewing a referral step (task)
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
    localConstants: { projectId: referral.opportunity.projectId },
  });

  const editable =
    status === CeReferralStepStatus.InProgress && step?.access.canPerformStep;

  if (!step || !formDefinition) return <NotFound />;

  if (
    [CeReferralStepStatus.Unavailable, CeReferralStepStatus.Available].includes(
      step.status
    )
  ) {
    // The step has to be started from the Referral Steps page
    return <NotFound />;
  }

  return (
    <>
      {editable ? (
        <DynamicForm
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
        />
      )}
    </>
  );
};

export default ReferralStepForm;
