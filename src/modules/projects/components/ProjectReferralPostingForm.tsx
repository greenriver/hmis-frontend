import { useCallback, useMemo, useState } from 'react';

import { emptyErrorState, partitionValidations } from '@/modules/errors/util';
import DynamicForm, {
  DynamicFormOnSubmit,
} from '@/modules/form/components/DynamicForm';
import { ReferralPostingDefinition } from '@/modules/form/data';
import {
  createInitialValuesFromRecord,
  getInitialValues,
  getItemMap,
  transformSubmitValues,
} from '@/modules/form/util/formUtil';
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
  const handleSubmit: DynamicFormOnSubmit = useCallback(
    ({ values }) => {
      const input = transformSubmitValues({
        definition: ReferralPostingDefinition,
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

  // hook copied from Edit Record
  const initialValues = useMemo(() => {
    const initialValuesFromDefinition = getInitialValues(
      ReferralPostingDefinition
    );
    const itemMap = getItemMap(ReferralPostingDefinition);

    const initialValuesFromRecord = createInitialValuesFromRecord(
      itemMap,
      referralPosting
    );
    const values = {
      ...initialValuesFromDefinition,
      ...initialValuesFromRecord,
    };
    return values;
  }, [referralPosting]);

  return (
    <DynamicForm
      definition={ReferralPostingDefinition}
      FormActionProps={{
        submitButtonText: 'Update Referral',
        discardButtonText: 'Cancel',
      }}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      loading={loading}
      errors={errors}
    />
  );
};
