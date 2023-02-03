import { TypedDocumentNode } from '@apollo/client';
import { CircularProgress, Paper } from '@mui/material';
import { Stack } from '@mui/system';
import { ReactNode, useMemo, useState } from 'react';

import DynamicField from '@/modules/form/components/DynamicField';
import useDynamicFormFields from '@/modules/form/hooks/useDynamicFormFields';
import {
  buildCommonInputProps,
  FormValues,
  LocalConstants,
} from '@/modules/form/util/formUtil';
import {
  FormDefinitionJson,
  FormItem,
  useGetFormDefinitionByIdentifierQuery,
  ValidationError,
  ServiceDetailType,
} from '@/types/gqlTypes';

const extractClientItemsFromDefinition = (
  definition: FormDefinitionJson
): [FormDefinitionJson, FormItem[]] => {
  const targetItems: FormItem[] = [];

  const traverse = (items: FormItem[]): FormItem[] => {
    return items.reduce((acc, item) => {
      if (item.serviceDetailType === ServiceDetailType.Client) {
        targetItems.push(item);
        return acc;
      }
      if (item.item) {
        return [
          ...acc,
          {
            ...item,
            item: traverse(item.item),
          },
        ];
      }
      return [...acc, item];
    }, [] as FormItem[]);
  };

  const bulkDefinition: FormDefinitionJson = {
    ...definition,
    item: traverse(definition.item),
  };

  return [bulkDefinition, targetItems];
};

export interface RenderListActions<TargetType> {
  onSelect: (item: TargetType) => any;
}

export interface Props<
  TargetType,
  Query,
  QueryVariables extends { input: unknown }
> {
  definition: FormDefinitionJson;
  mutationDocument: TypedDocumentNode<Query, QueryVariables>;
  inputVariables?: Record<string, any>;
  localConstants?: LocalConstants;
  renderList?: (
    items: {
      getNode: (target: TargetType) => ReactNode;
      item: FormItem;
      label?: string | null | undefined;
    }[],
    actions: RenderListActions<TargetType>
  ) => React.ReactNode;
  onCompleted: (data: Query) => void;
  getErrors: (data: Query) => ValidationError[] | undefined;
  getKeyForItem: (item: TargetType) => string;
  getInputFromItem: (
    formData: Record<string, any>,
    target: TargetType
  ) => QueryVariables['input'];
  title: ReactNode;
}

/**
 * Renders a form for creating or updating a record of type RecordType.
 */
const BulkAdd = <
  TargetType extends { id: string },
  Query extends Record<string, string | Record<string, unknown> | null>,
  QueryVariables extends { input: unknown }
>(
  props: Props<TargetType, Query, QueryVariables>
) => {
  const {
    definition,
    // mutationDocument,
    // inputVariables,
    // localConstants,
    renderList,
    // onCompleted,
    // getErrors,
    getInputFromItem,
    getKeyForItem,
    // title,
  } = props;
  // const [errors, setErrors] = useState<ValidationError[] | undefined>();
  // const [warnings, setWarnings] = useState<ValidationError[] | undefined>();

  const [targetValues, setTargetValues] = useState<FormValues>({});

  const [bulkDefinition, allTargetItems] = useMemo(
    () => extractClientItemsFromDefinition(definition),
    [definition]
  );

  const { renderFields, values, shouldShowItem, getCleanedValues } =
    useDynamicFormFields({
      definition,
      bulk: true,
    });

  const targetItems = useMemo(
    () => allTargetItems.filter(shouldShowItem),
    [allTargetItems, shouldShowItem]
  );

  const handleSelect: RenderListActions<TargetType>['onSelect'] = (item) => {
    const baseInput = getCleanedValues();
    const targetInput = targetValues[getKeyForItem(item)];
    const input = getInputFromItem({ ...baseInput, ...targetInput }, item);
    console.log({ input });
  };

  console.log({
    props,
    definition,
    bulkDefinition,
    allTargetItems,
    targetItems,
    values,
  });

  return (
    <Stack gap={2}>
      {renderFields({
        // errors,
        // warnings,
      })}
      <Paper
        sx={{
          py: 3,
          px: 2.5,
        }}
      >
        {renderList &&
          renderList(
            targetItems.map((item) => ({
              label: item.text,
              item,
              getNode: (target) => (
                <DynamicField
                  noLabel
                  nestingLevel={0}
                  key={item.linkId}
                  item={item}
                  itemChanged={(linkId, value) =>
                    setTargetValues({
                      ...targetValues,
                      [getKeyForItem(target)]: { [linkId]: value },
                    })
                  }
                  value={targetValues?.[getKeyForItem(target)]?.[item.linkId]}
                  // errors={getFieldErrors(item)}
                  {...props}
                  inputProps={{
                    ...buildCommonInputProps(item, values),
                  }}
                />
              ),
            })),
            { onSelect: handleSelect }
          )}
      </Paper>
    </Stack>
  );

  // useScrollToHash(definitionLoading, top);

  // const definition: FormDefinitionJson | undefined = useMemo(
  //   () => data?.formDefinition?.definition,
  //   [data]
  // );
  // const itemMap = useMemo(
  //   () => (definition ? getItemMap(definition, false) : undefined),
  //   [definition]
  // );

  // const [mutateFunction, { loading: saveLoading, error: mutationError }] =
  //   useMutation<Query, QueryVariables>(mutationDocument, {
  //     onCompleted: (data) => {
  //       const errors = getErrors(data) || [];

  //       if (errors.length > 0) {
  //         const warnings = errors.filter((e) => e.type === CONFIRM_ERROR_TYPE);
  //         const validationErrors = errors.filter(
  //           (e) => e.type !== CONFIRM_ERROR_TYPE
  //         );
  //         if (validationErrors.length > 0) window.scrollTo(0, 0);
  //         setWarnings(warnings);
  //         setErrors(validationErrors);
  //       } else {
  //         window.scrollTo(0, 0);
  //         onCompleted(data);
  //       }
  //     },
  //   });

  // const initialValues = useMemo(() => {
  //   if (!itemMap || !definition) return {};
  //   const initialValuesFromDefinition = getInitialValues(
  //     definition,
  //     localConstants
  //   );
  //   if (!record) return initialValuesFromDefinition;

  //   const initialValuesFromRecord = createInitialValuesFromRecord(
  //     itemMap,
  //     record
  //   );
  //   const values = {
  //     ...initialValuesFromDefinition,
  //     ...initialValuesFromRecord,
  //   };
  //   console.log('Initial form values:', values, 'from', record);
  //   return values;
  // }, [record, definition, itemMap, localConstants]);

  // const submitHandler = useCallback(
  //   (values: Record<string, any>, confirmed = false) => {
  //     if (!definition) return;
  //     // Transform values into client input mutation variables
  //     const inputValues = transformSubmitValues({
  //       definition,
  //       values,
  //       autofillNotCollected: true,
  //       autofillNulls: true,
  //       autofillBooleans: false,
  //     });
  //     console.log('Submitted form values:', inputValues);

  //     const input = {
  //       input: { ...inputValues, ...inputVariables },
  //       id: record?.id,
  //       confirmed: confirmable ? confirmed : undefined,
  //     };

  //     setWarnings([]);
  //     setErrors([]);
  //     void mutateFunction({ variables: { input } as QueryVariables });
  //   },
  //   [definition, inputVariables, mutateFunction, record, confirmable]
  // );

  // // Top-level items for the left nav (of >=3 groups)
  // const leftNavItems = useMemo(() => {
  //   if (!definition || !itemMap) return false;

  //   let topLevelItems = definition.item.filter(
  //     (i) => i.type === ItemType.Group && !i.hidden
  //   );

  //   if (topLevelItems.length < 3) return false;

  //   // Remove disabled groups
  //   topLevelItems = topLevelItems.filter((item) =>
  //     shouldEnableItem(item, initialValues, itemMap)
  //   );
  //   if (topLevelItems.length < 3) return false;
  //   return topLevelItems;
  // }, [itemMap, definition, initialValues]);

  // if (definitionLoading) return <Loading />;
  // if (definitionError) console.error(definitionError);
  // if (!definition) throw Error('Definition not found');

  // const form = (
  //   <>
  //     <DynamicForm
  //       definition={definition}
  //       onSubmit={submitHandler}
  //       submitButtonText='Save Changes'
  //       discardButtonText='Discard'
  //       initialValues={initialValues}
  //       loading={saveLoading}
  //       errors={errors}
  //       warnings={warnings}
  //       {...props}
  //     />
  //     {mutationError && (
  //       <Box sx={{ mt: 3 }}>
  //         <ApolloErrorAlert error={mutationError} />
  //       </Box>
  //     )}
  //   </>
  // );

  // if (leftNavItems) {
  //   return (
  //     <>
  //       <Box
  //         sx={{
  //           backgroundColor: (theme) => theme.palette.background.default,
  //           zIndex: (theme) => theme.zIndex.appBar,
  //         }}
  //       >
  //         {title}
  //       </Box>
  //       <Grid container spacing={2} sx={{ pb: 20, mt: 0 }}>
  //         <FormNavigation items={leftNavItems} top={top} {...navigationProps}>
  //           {form}
  //         </FormNavigation>
  //       </Grid>
  //     </>
  //   );
  // }

  // return (
  //   <>
  //     {title}
  //     <Grid container spacing={2} sx={{ pb: 20, mt: 0 }}>
  //       <Grid item xs>
  //         {form}
  //       </Grid>
  //     </Grid>
  //   </>
  // );
};

const BulkAddWrapper = <
  TargetType extends { id: string },
  Query extends Record<string, string | Record<string, unknown> | null>,
  QueryVariables extends { input: unknown }
>(
  props: Omit<Props<TargetType, Query, QueryVariables>, 'definition'> & {
    definitionIdentifier: string;
  }
) => {
  const { definitionIdentifier } = props;

  const { data } = useGetFormDefinitionByIdentifierQuery({
    variables: { identifier: definitionIdentifier },
  });

  const definition = data?.formDefinition?.definition;

  if (!definition) return <CircularProgress />;

  return <BulkAdd {...props} definition={definition} />;
};

export default BulkAddWrapper;
