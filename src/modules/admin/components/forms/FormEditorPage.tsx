import Loading from '@/components/elements/Loading';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import { useGetFormDefinitionFieldsForEditorQuery } from '@/types/gqlTypes';

const FormEditorPage = () => {
  const { formId } = useSafeParams() as { formId: string };

  const { data: { formDefinition } = {}, error } =
    useGetFormDefinitionFieldsForEditorQuery({
      variables: { id: formId },
    });

  if (error) throw error;
  if (!formDefinition) return <Loading />;

  return (
    <>
      <PageTitle title={`Edit Form: ${formDefinition.title}`} />
    </>
  );
};

export default FormEditorPage;
