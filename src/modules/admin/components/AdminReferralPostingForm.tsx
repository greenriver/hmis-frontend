import { useCallback, useState } from 'react';

import { emptyErrorState, partitionValidations } from '@/modules/errors/util';
import DynamicForm, {
  DynamicFormOnSubmit,
} from '@/modules/form/components/DynamicForm';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import { AdminReferralPostingDefinition } from '@/modules/form/data';
import useInitialFormValues from '@/modules/form/hooks/useInitialFormValues';
import { SubmitFormAllowedTypes } from '@/modules/form/types';
import { transformSubmitValues } from '@/modules/form/util/formUtil';
import {
  ReferralPostingDetailFieldsFragment,
  ReferralPostingInput,
  useUpdateReferralPostingMutation,
} from '@/types/gqlTypes';

interface Props {
  referralPosting: ReferralPostingDetailFieldsFragment;
  readOnly?: boolean;
}

const AdminReferralPostingForm: React.FC<Props> = ({
  referralPosting,
  readOnly = false,
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
  const handleSubmit: DynamicFormOnSubmit = useCallback(
    ({ values }) => {
      const input = transformSubmitValues({
        definition: AdminReferralPostingDefinition,
        values,
        keyByFieldName: true,
      }) as ReferralPostingInput;

      mutate({
        variables: {
          id: referralPosting.id,
          input,
        },
      });
    },
    [mutate, referralPosting.id]
  );

  const initialValues = useInitialFormValues({
    definition: AdminReferralPostingDefinition,
    record: referralPosting as unknown as SubmitFormAllowedTypes,
  });

  if (readOnly) {
    return (
      <DynamicView
        values={initialValues}
        definition={AdminReferralPostingDefinition}
      />
    );
  }

  return (
    <DynamicForm
      definition={AdminReferralPostingDefinition}
      FormActionProps={{
        submitButtonText: 'Save',
        discardButtonText: 'Cancel',
      }}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      loading={loading}
      errors={errors}
    />
  );
};

export default AdminReferralPostingForm;
