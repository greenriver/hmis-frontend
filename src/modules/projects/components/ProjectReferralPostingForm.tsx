import { cloneDeep, remove } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { emptyErrorState, partitionValidations } from '@/modules/errors/util';
import DynamicForm, {
  DynamicFormOnSubmit,
} from '@/modules/form/components/DynamicForm';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import { ReferralPostingDefinition } from '@/modules/form/data';
import useInitialFormValues from '@/modules/form/hooks/useInitialFormValues';
import { SubmitFormAllowedTypes } from '@/modules/form/types';
import {
  localResolvePickList,
  transformSubmitValues,
} from '@/modules/form/util/formUtil';
import {
  ReferralPostingDetailFieldsFragment,
  ReferralPostingInput,
  ReferralPostingStatus,
  useUpdateReferralPostingMutation,
} from '@/types/gqlTypes';

interface Props {
  referralPosting: ReferralPostingDetailFieldsFragment;
  readOnly?: boolean;
}

export const ProjectReferralPostingForm: React.FC<Props> = ({
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

  const definition = useMemo(() => {
    const definitionCopy = cloneDeep(ReferralPostingDefinition);
    if (readOnly) {
      // If this is a read-only view, we can show any status, so include them all in the "pick list" to resolve the correct labels.
      definitionCopy.item[0].pickListOptions = localResolvePickList(
        'ReferralPostingStatus'
      );
      return definitionCopy;
    }
    // Hacky way to drop the "Assigned" option if this posting is in AcceptedPending status.
    // This lets user change from AcceptedPending=>DeniedPending which is sometimes necessary.
    if (
      referralPosting.status === ReferralPostingStatus.AcceptedPendingStatus &&
      definitionCopy.item[0].pickListOptions
    ) {
      remove(
        definitionCopy.item[0].pickListOptions,
        (opt) => opt.code === ReferralPostingStatus.AssignedStatus
      );
    }
    return definitionCopy;
  }, [readOnly, referralPosting]);

  const handleSubmit: DynamicFormOnSubmit = useCallback(
    ({ rawValues }) => {
      setErrors(emptyErrorState);
      const input = transformSubmitValues({
        definition,
        values: rawValues,
        keyByFieldName: true,
      }) as ReferralPostingInput;
      mutate({
        variables: {
          id: referralPosting.id,
          input,
        },
      });
    },
    [mutate, definition, referralPosting.id]
  );

  const initialValues = useInitialFormValues({
    definition,
    record: referralPosting as unknown as SubmitFormAllowedTypes,
  });

  if (readOnly) {
    return (
      <DynamicView
        values={initialValues}
        definition={definition}
        GridProps={{ columnSpacing: 0, rowSpacing: 2, spacing: 0 }}
      />
    );
  }

  return (
    <DynamicForm
      definition={definition}
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
