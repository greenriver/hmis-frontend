import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import FormBuilder from '@/modules/formBuilder/components/FormBuilder';
import { useGetFormDefinitionFieldsForEditorQuery } from '@/types/gqlTypes';

const FormBuilderPage = () => {
  const { formId } = useSafeParams() as { formId: string };

  const {
    data: { formDefinition: initialFormDefinition } = {},
    loading: fetchLoading,
    error: fetchError,
  } = useGetFormDefinitionFieldsForEditorQuery({
    variables: { id: formId },
  });

  if (fetchError) throw fetchError;
  if (!initialFormDefinition && fetchLoading) return <Loading />;
  if (!initialFormDefinition) return <NotFound />;

  return <FormBuilder formDefinition={initialFormDefinition} />;
};

export default FormBuilderPage;
