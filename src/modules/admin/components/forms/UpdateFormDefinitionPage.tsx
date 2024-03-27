// eslint-disable-next-line no-restricted-imports
import { useParams } from 'react-router-dom';
import FormEditor from './FormEditor';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import {
  useGetFormDefinitionForEditorQuery,
  useUpdateFormDefinitionMutation,
} from '@/types/gqlTypes';

const UpdateFormDefinitionPage = () => {
  const { formId } = useParams() as { formId: string };

  const { data: { formDefinition } = {}, error } =
    useGetFormDefinitionForEditorQuery({
      variables: { id: formId },
    });

  const [updateFormDefinition, { loading }] = useUpdateFormDefinitionMutation();

  if (error) throw error;
  if (!formDefinition) return <Loading />;

  return (
    <>
      <PageTitle title={`Edit Form: ${formDefinition?.title}`} />
      {formDefinition && (
        <FormEditor
          definition={formDefinition?.rawDefinition}
          onSave={(values) => {
            updateFormDefinition({
              variables: {
                id: formId,
                input: { definition: JSON.stringify(values) },
              },
            });
          }}
          saveLoading={loading}
        />
      )}
    </>
  );
};

export default UpdateFormDefinitionPage;
