// eslint-disable-next-line no-restricted-imports
import { useParams } from 'react-router-dom';
import FormEditor from './FormEditor';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import {
  useGetFormIdentifierForEditorQuery,
  useUpdateFormDefinitionMutation,
} from '@/types/gqlTypes';

const UpdateFormDefinitionPage = () => {
  const { formIdentifier: identifier } = useParams() as {
    formIdentifier: string;
  };

  const { data: { formIdentifier } = {}, error } =
    useGetFormIdentifierForEditorQuery({
      variables: { identifier },
    });

  const [updateFormDefinition, { loading }] = useUpdateFormDefinitionMutation();

  if (error) throw error;
  if (!formIdentifier) return <Loading />;

  return (
    <>
      <PageTitle title={`Edit Form: ${formIdentifier.title}`} />
      {formIdentifier.draft && (
        <FormEditor
          definition={formIdentifier.draft.rawDefinition}
          onSave={(values) => {
            updateFormDefinition({
              variables: {
                id: formIdentifier.currentVersion.id,
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
