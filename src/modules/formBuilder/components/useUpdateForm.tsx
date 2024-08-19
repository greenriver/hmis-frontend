import { useCallback, useState } from 'react';
import {
  ErrorState,
  emptyErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import {
  FormDefinitionJson,
  useUpdateFormDefinitionMutation,
} from '@/types/gqlTypes';

interface Args {
  formId: string;
  onSuccess: (updatedForm: FormDefinitionJson) => void;
}

// This hook has the logic for submitting a FormDefinition using the UpdateFormDefinition mutation.
// This is to handle form submission in 2 components:
// - FormBuilder: the main form editor page where items can be re-ordered
// - FormEditorItemProperties: the editor in the drawer that pops open when editing an individual item
export function useUpdateForm({ formId, onSuccess }: Args) {
  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  const [updateFormDefinition, { loading, error }] =
    useUpdateFormDefinitionMutation({
      onCompleted: (data) => {
        if (
          data.updateFormDefinition?.errors &&
          data.updateFormDefinition.errors.length > 0
        ) {
          setErrorState(partitionValidations(data.updateFormDefinition.errors));
        } else if (data.updateFormDefinition?.formDefinition) {
          setErrorState(emptyErrorState);
          onSuccess(data.updateFormDefinition.formDefinition.definition);
        } else {
          throw new Error('unexpected response');
        }
      },
    });

  if (error) throw error;

  // callback to use with rhf submission
  const updateForm = useCallback(
    (newDefinition: FormDefinitionJson) => {
      return updateFormDefinition({
        variables: {
          id: formId,
          input: { definition: JSON.stringify(newDefinition) },
        },
      });
    },
    [formId, updateFormDefinition]
  );

  return { updateForm, loading, errorState };
}
