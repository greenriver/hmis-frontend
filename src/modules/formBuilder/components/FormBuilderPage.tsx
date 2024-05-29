import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import FormBuilderContents from '@/modules/formBuilder/components/FormBuilderContents';
import { formatDateForDisplay } from '@/modules/hmis/hmisUtil';
import {
  useGetFormDefinitionFieldsForEditorQuery,
  useUpdateFormDefinitionMutation,
} from '@/types/gqlTypes';

const FormBuilderPage = () => {
  const { formId } = useSafeParams() as { formId: string };

  const {
    data: { formDefinition } = {},
    loading: fetchLoading,
    error: fetchError,
  } = useGetFormDefinitionFieldsForEditorQuery({
    variables: { id: formId },
  });

  // TODO(#6090) - update the API to return correct values
  const lastUpdatedDate = formatDateForDisplay(new Date());
  const lastUpdatedBy = 'User Name';

  const [updateFormDefinition, { loading: saveLoading, error: saveError }] =
    useUpdateFormDefinitionMutation();

  if (fetchError) throw fetchError;
  if (saveError) throw saveError;

  if (!formDefinition) {
    if (fetchLoading) return <Loading />;
    return <NotFound />;
  }

  return (
    <FormBuilderContents
      formDefinition={formDefinition}
      lastUpdatedDate={lastUpdatedDate || undefined}
      lastUpdatedBy={lastUpdatedBy}
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
