import { useCallback, useMemo, useState } from 'react';

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
  FormDefinitionJsonFieldsFragment,
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
  const formDefinition = useMemo<FormDefinitionJsonFieldsFragment>(() => {
    if (referralPosting.postingIdentifier) {
      // came from LINK, show re-request option
      return AdminReferralPostingDefinition;
    } else {
      // referral request originated locally, hide re-request option
      return {
        ...AdminReferralPostingDefinition,
        item: AdminReferralPostingDefinition.item.filter(
          (i) => i.linkId !== 'reRequest'
        ),
      };
    }
  }, [referralPosting.postingIdentifier]);
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
        definition: formDefinition,
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
    [mutate, referralPosting.id, formDefinition]
  );

  const initialValues = useInitialFormValues({
    definition: formDefinition,
    record: referralPosting as unknown as SubmitFormAllowedTypes,
    // there may be some way to use this to set re-request
    //localConstants: { reRequest: 'true' },
  });

  if (readOnly) {
    return (
      <DynamicView
        values={initialValues}
        definition={formDefinition}
        GridProps={{
          columnSpacing: 0,
          rowSpacing: 2,
          spacing: 0,
        }}
      />
    );
  }

  return (
    <DynamicForm
      definition={formDefinition}
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
