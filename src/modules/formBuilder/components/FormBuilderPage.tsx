import { useEffect, useMemo, useState } from 'react';
import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import {
  emptyErrorState,
  ErrorState,
  partitionValidations,
} from '@/modules/errors/util';
import FormBuilder from '@/modules/formBuilder/components/FormBuilder';
import { formatDateForDisplay } from '@/modules/hmis/hmisUtil';
import {
  FormDefinitionJson,
  FormItem,
  useGetFormDefinitionFieldsForEditorQuery,
  useUpdateFormDefinitionMutation,
} from '@/types/gqlTypes';

const FormBuilderPage = () => {
  const { formId } = useSafeParams() as { formId: string };

  const [workingDefinition, setWorkingDefinition] = useState<
    FormDefinitionJson | undefined
  >();

  const {
    data: { formDefinition: initialFormDefinition } = {},
    loading: fetchLoading,
    error: fetchError,
  } = useGetFormDefinitionFieldsForEditorQuery({
    variables: { id: formId },
    onCompleted: (data) => {
      setWorkingDefinition(data.formDefinition?.definition);
    },
  });

  // TODO(#6090) - update the API to return correct values
  const lastUpdatedDate = formatDateForDisplay(new Date());
  const lastUpdatedBy = 'User Name';

  const [selectedItem, setSelectedItem] = useState<FormItem | undefined>(
    undefined
  );

  const [errorState, setErrorState] = useState<ErrorState>(emptyErrorState);

  useEffect(() => {
    setErrorState(emptyErrorState);
  }, [selectedItem, setErrorState]);
  const [
    updateFormDefinition,
    { loading: saveLoading, error: saveError, data },
  ] = useUpdateFormDefinitionMutation({
    onCompleted: (data) => {
      if (
        data.updateFormDefinition?.errors &&
        data.updateFormDefinition.errors.length > 0
      ) {
        setErrorState(partitionValidations(data.updateFormDefinition.errors));
      } else {
        setWorkingDefinition(
          data.updateFormDefinition?.formDefinition?.definition
        );
        setErrorState(emptyErrorState);
        setSelectedItem(undefined);
      }
    },
  });

  const formDefinition = useMemo(() => {
    // TODO - test this thoroughly around error cases.
    // If the mutation fails, then `data` would be present but `data.updateFormDefinition?.formDefinition` would be null.
    // In that case, it's not correct to use `initialFormDefinition` - we want the most recent successfully saved definition instead
    if (data && data.updateFormDefinition?.formDefinition)
      return data.updateFormDefinition.formDefinition;
    return initialFormDefinition;
  }, [data, initialFormDefinition]);

  if (fetchError) throw fetchError;
  if (saveError) throw saveError;

  if (!formDefinition) {
    if (fetchLoading) return <Loading />;
    return <NotFound />;
  }

  // TODO(#6094, #6083) Disable interaction with the form structure while the save mutation is loading

  return (
    <FormBuilder
      formDefinition={formDefinition}
      workingDefinition={workingDefinition}
      setWorkingDefinition={setWorkingDefinition}
      errorState={errorState}
      lastUpdatedDate={lastUpdatedDate || undefined}
      lastUpdatedBy={lastUpdatedBy}
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
      onSave={(newDefinition) => {
        return updateFormDefinition({
          variables: {
            id: formDefinition.id,
            input: { definition: JSON.stringify(newDefinition) },
          },
        });
      }}
      saveLoading={saveLoading}
    />
  );
};

export default FormBuilderPage;
