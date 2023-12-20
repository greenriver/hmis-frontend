// eslint-disable-next-line no-restricted-imports
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import FormEditor from './FormEditor';
import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import { useGetFormDefinitionByIdQuery } from '@/types/gqlTypes';

const FormEditorPage = () => {
  const { formId } = useParams() as { formId: string };
  const [loading, setLoading] = useState(false);

  const { data: { formDefinition } = {}, error } =
    useGetFormDefinitionByIdQuery({
      variables: { id: formId },
    });

  if (error) throw error;
  if (!formDefinition) return <Loading />;

  return (
    <>
      <PageTitle title={`Edit Form Definition: ${formDefinition?.title}`} />

      {formDefinition && (
        <FormEditor
          definition={formDefinition?.rawDefinition}
          onSave={(values) => {
            console.log({ values });
            setLoading(true);
          }}
          saveLoading={loading}
        />
      )}
    </>
  );
};

export default FormEditorPage;
