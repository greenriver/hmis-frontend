import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { convertFormDefinition } from '@/modules/form/util/formUtil';
import FormBuilderContents from '@/modules/formBuilder/components/FormBuilderContents';
import { formatDateForDisplay } from '@/modules/hmis/hmisUtil';
import {
  useGetFormDefinitionFieldsForEditorQuery,
  useUpdateFormDefinitionTypedMutation,
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

  const [
    updateFormDefinitionTyped,
    { loading: saveLoading, error: saveError },
  ] = useUpdateFormDefinitionTypedMutation();

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
        return updateFormDefinitionTyped({
          variables: {
            id: formDefinition.id,
            definition: convertFormDefinition(newDefinition),
          },
        });
      }}
      saveLoading={saveLoading}
    />
  );
};

export default FormBuilderPage;
