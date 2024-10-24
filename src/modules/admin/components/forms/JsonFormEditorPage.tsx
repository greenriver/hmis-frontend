import { useMemo } from 'react';
import JsonFormEditor from './JsonFormEditor';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
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

  const [
    updateFormDefinition,
    { loading, data: saveResponse, error: saveError },
  ] = useUpdateFormDefinitionFromJsonEditorMutation();

  const validationErrors = useMemo(
    () => saveResponse?.updateFormDefinition?.errors,
    [saveResponse]
  );
  if (error) throw error;
  if (!formDefinition) return <Loading />;

  return (
    <>
      <PageTitle title={`Edit Form: ${formDefinition.title}`} />
      {saveError && <ApolloErrorAlert error={saveError} />}
      {validationErrors && <ErrorAlert errors={validationErrors} />}
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
