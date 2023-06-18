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
  ReferralPostingDetailFieldsFragment,
  ReferralPostingInput,
  useUpdateReferralPostingMutation,
} from '@/types/gqlTypes';

interface Props {
  referralPosting: ReferralPostingDetailFieldsFragment;
  readOnly?: boolean;
}

const AdminReferralPostingForm: React.FC<Props> = ({
  readOnly = false,
  ...props
}) => {
  const referralPosting = useMemo(() => {
    const record = props.referralPosting;
    // the status is denied pending status but we don't allow this option in the form. Set it to null instead
    return {
      ...record,
      status: record.status == 'denied_pending_status' ? null : record.status,
    };
  }, [props.referralPosting]);

  const formDefinition = AdminReferralPostingDefinition;
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
    localConstants: {
      hasReferralRequest:
        !!referralPosting.postingIdentifier &&
        !!referralPosting.referralRequest,
    },
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
