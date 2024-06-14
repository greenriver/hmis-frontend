// eslint-disable-next-line no-restricted-imports
import JsonFormEditor from './JsonFormEditor';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import {
  useGetFormDefinitionFieldsForJsonEditorQuery,
  useUpdateFormDefinitionFromJsonEditorMutation,
} from '@/types/gqlTypes';

const JsonFormEditorPage = () => {
  const { formId } = useSafeParams() as { formId: string };

  const { data: { formDefinition } = {}, error } =
    useGetFormDefinitionFieldsForJsonEditorQuery({
      variables: { id: formId },
    });

  const [updateFormDefinition, { loading }] =
    useUpdateFormDefinitionFromJsonEditorMutation();

  if (error) throw error;
  if (!formDefinition) return <Loading />;

  return (
    <>
      <PageTitle title={`Edit Form: ${formDefinition.title}`} />
      <JsonFormEditor
        definition={formDefinition.rawDefinition}
        onSave={(values) => {
          updateFormDefinition({
            variables: {
              id: formDefinition.id,
              input: { definition: JSON.stringify(values) },
            },
          });
        }}
        saveLoading={loading}
      />
    </>
  );
};

export default JsonFormEditorPage;
