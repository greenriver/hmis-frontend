import { useCallback, useMemo, useState } from 'react';

import { emptyErrorState, partitionValidations } from '@/modules/errors/util';
import DynamicForm, {
  DynamicFormOnSubmit,
} from '@/modules/form/components/DynamicForm';
import { OutgoingReferralPostingDefinition } from '@/modules/form/data';
import useInitialFormValues from '@/modules/form/hooks/useInitialFormValues';
import { SubmitFormAllowedTypes } from '@/modules/form/types';
import { transformSubmitValues } from '@/modules/form/util/formUtil';
import {
  OutgoingReferralPostingInput,
  ProjectAllFieldsFragment,
  useCreateOutgoingReferralPostingMutation,
} from '@/types/gqlTypes';

const defaultValues = {};
interface Props {
  project: ProjectAllFieldsFragment;
  onComplete: VoidFunction;
}
const ProjectOutgoingReferralForm: React.FC<Props> = ({
  project,
  onComplete,
}) => {
  const formDefinition = OutgoingReferralPostingDefinition;
  const [errors, setErrors] = useState(emptyErrorState);
  const [mutate, { loading }] = useCreateOutgoingReferralPostingMutation({
    onCompleted: (data) => {
      const { errors: remoteErrors = [] } =
        data.createOutgoingReferralPosting || {};
      if (remoteErrors.length) {
        setErrors(partitionValidations(remoteErrors));
      } else {
        onComplete();
      }
    },
    onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
  });
  const handleSubmit: DynamicFormOnSubmit = useCallback(
    ({ values }) => {
      setErrors(emptyErrorState);
      const input = transformSubmitValues({
        definition: formDefinition,
        values,
        keyByFieldName: true,
      }) as OutgoingReferralPostingInput;

      mutate({
        variables: {
          input,
        },
      });
    },
    [mutate, formDefinition]
  );

  const initialValues = useInitialFormValues({
    definition: formDefinition,
    record: defaultValues as unknown as SubmitFormAllowedTypes,
  });
  const pickListArgs = useMemo(() => ({ projectId: project.id }), [project]);

  return (
    <DynamicForm
      definition={formDefinition}
      FormActionProps={{
        submitButtonText: 'Create Referral',
        discardButtonText: 'Cancel',
      }}
      initialValues={initialValues}
      onSubmit={handleSubmit}
      loading={loading}
      errors={errors}
      pickListArgs={pickListArgs}
    />
  );
};

export default ProjectOutgoingReferralForm;
