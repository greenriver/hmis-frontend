import { useCallback, useState } from 'react';

import { emptyErrorState, partitionValidations } from '@/modules/errors/util';
import DynamicForm, {
  DynamicFormOnSubmit,
} from '@/modules/form/components/DynamicForm';
import { ReferralPostingDefinition } from '@/modules/form/data';
import { transformSubmitValues } from '@/modules/form/util/formUtil';
import {
  ReferralPostingDetailFieldsFragment,
  ReferralPostingInput,
  useUpdateReferralPostingMutation,
} from '@/types/gqlTypes';

interface Props {
  referralPosting: ReferralPostingDetailFieldsFragment;
}
export const ProjectReferralPostingForm: React.FC<Props> = ({
  referralPosting,
}) => {
  const [errors, setErrors] = useState(emptyErrorState);
  const [mutate, { loading }] = useUpdateReferralPostingMutation({
    onCompleted: (data) => {
      const { errors: remoteErrors = [] } = data.updateReferralPosting || {};
      if (remoteErrors.length) {
        setErrors(partitionValidations(remoteErrors));
      }
    },
    onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
  });
  console.info(referralPosting);
  const handleSubmit: DynamicFormOnSubmit = useCallback(
    ({ values }) => {
      const input = transformSubmitValues({
        definition: ReferralPostingDefinition,
        values,
        keyByFieldName: true,
      }) as ReferralPostingInput;

      console.debug('submitting', input);
      mutate({
        variables: {
          id: referralPosting.id,
          input,
        },
      });
    },
    [mutate, referralPosting.id]
  );

  return (
    <DynamicForm
      definition={ReferralPostingDefinition}
      FormActionProps={{
        submitButtonText: 'Update Referral',
        discardButtonText: 'Cancel',
      }}
      initialValues={referralPosting}
      onSubmit={handleSubmit}
      loading={loading}
      errors={errors}
    />
  );
};
