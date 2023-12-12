import { useMemo } from 'react';
// eslint-disable-next-line no-restricted-imports
// import { useParams } from 'react-router-dom';
import DynamicForm from '@/modules/form/components/DynamicForm';
import useInitialFormValues from '@/modules/form/hooks/useInitialFormValues';
import { getItemMap } from '@/modules/form/util/formUtil';
import {
  AdminFormRole,
  DataCollectedAbout,
  ProjectType,
  useGetAdminFormDefinitionQuery,
} from '@/types/gqlTypes';

// is it worth using DynamicForm with a custom mutation? yeah, I think so. with these we have lots of side effects and warnings and things, just want to be able to use standard mutations to encapsulate them.
const EditFormRulePage = () => {
  // const { formRuleId } = useParams();

  const { data } = useGetAdminFormDefinitionQuery({
    variables: { role: AdminFormRole.FormRule },
  });

  const itemMap = useMemo(
    () =>
      data &&
      data.adminFormDefinition &&
      getItemMap(data.adminFormDefinition.definition),
    [data]
  );

  // the TYPE here is actually the input type for the mutation. so we basically construct the "defaults" based on what we have
  const record = {
    id: '1',
    projectType: ProjectType.DayShelter,
    funder: null,
    otherFunder: null,
    dataCollectedAbout: DataCollectedAbout.Hoh,
    // definition ID
  };

  const initialValues = useInitialFormValues({
    record,
    itemMap,
    definition: data?.adminFormDefinition?.definition,
    localConstants: {},
  });

  // console.log(initialValues);
  // similar hook but we don't want the submit handler...
  // const { initialValues, itemMap, errors, onSubmit, submitLoading } =
  //   useDynamicFormHandlersForRecord({
  //     inputVariables: {},
  //     localConstants: {},
  //     formDefinition: data?.adminFormDefinition,
  //     record: null,
  //     // onCompleted,
  //   });

  if (!data) return <>{'loading...'}</>;

  return (
    <DynamicForm
      initialValues={initialValues}
      definition={data?.adminFormDefinition?.definition}
      onSubmit={() => {
        // console.log(args);
        throw new Error('Function not implemented.');
      }}
      errors={{
        apolloError: undefined,
        errors: [],
        warnings: [],
      }}
    />
  );
};

export default EditFormRulePage;
