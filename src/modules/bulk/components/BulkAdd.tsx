import { TypedDocumentNode, useMutation } from '@apollo/client';
import { Alert, CircularProgress, Paper } from '@mui/material';
import { Stack } from '@mui/system';
import { isEmpty } from 'lodash-es';
import { ReactNode, useMemo, useState } from 'react';

import DynamicField, {
  DynamicFieldProps,
} from '@/modules/form/components/DynamicField';
import useDynamicFormFields from '@/modules/form/hooks/useDynamicFormFields';
import {
  buildCommonInputProps,
  CONFIRM_ERROR_TYPE,
  FormValues,
  LocalConstants,
} from '@/modules/form/util/formUtil';
import { transformSubmitValues } from '@/modules/form/util/recordFormUtil';
import {
  FormDefinitionJson,
  FormItem,
  useGetFormDefinitionByIdentifierQuery,
  ValidationError,
  ServiceDetailType,
} from '@/types/gqlTypes';

const extractClientItemsFromDefinition = (definition: FormDefinitionJson) => {
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

  return { bulkDefinition, targetItems } as const;
};

export interface RenderListOptions<TargetType> {
  onSelect: (item: TargetType) => any;
  mutationLoading?: boolean;
}

export interface Props<TargetType, Query, QueryVariables> {
  definition: FormDefinitionJson;
  mutationDocument: TypedDocumentNode<Query, QueryVariables>;
  inputVariables?: Record<string, any>;
  localConstants?: LocalConstants;
  renderList?: (
    items: {
      getNode: (
        target: TargetType,
        props?: Partial<DynamicFieldProps>
      ) => ReactNode;
      item: FormItem;
      label?: string | null | undefined;
    }[],
    options: RenderListOptions<TargetType>
  ) => React.ReactNode;
  onCompleted: (data: Query) => void;
  getErrors: (data: Query) => ValidationError[] | undefined;
  getKeyForItem: (item: TargetType) => string;
  getInputFromItem: (
    formData: Record<string, any>,
    target: TargetType
  ) => QueryVariables;
  title: ReactNode;
}

/**
 * Renders a form for creating or updating a record of type RecordType.
 */
const BulkAdd = <
  TargetType extends { id: string },
  Query extends Record<string, string | Record<string, unknown> | null>,
  QueryVariables
>(
  props: Props<TargetType, Query, QueryVariables>
) => {
  const {
    definition,
    mutationDocument,
    // inputVariables,
    // localConstants,
    renderList,
    onCompleted,
    getErrors,
    getInputFromItem,
    getKeyForItem,
    title,
  } = props;
  const [errors, setErrors] = useState<ValidationError[] | undefined>();
  const [warnings, setWarnings] = useState<ValidationError[] | undefined>();

  const [targetValues, setTargetValues] = useState<Record<string, FormValues>>(
    {}
  );

  const { targetItems: allTargetItems } = useMemo(
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

  const [mutateFunction, { loading: mutationLoading }] = useMutation<
    Query,
    QueryVariables
  >(mutationDocument, {
    onCompleted: (data) => {
      const errors = getErrors(data) || [];

      if (errors.length > 0) {
        const warnings = errors.filter((e) => e.type === CONFIRM_ERROR_TYPE);
        const validationErrors = errors.filter(
          (e) => e.type !== CONFIRM_ERROR_TYPE
        );
        if (validationErrors.length > 0) window.scrollTo(0, 0);
        setWarnings(warnings);
        setErrors(validationErrors);
      } else {
        window.scrollTo(0, 0);
        onCompleted(data);
        setWarnings([]);
        setErrors([]);
      }
    },
  });

  const handleSelect: RenderListOptions<TargetType>['onSelect'] = (item) => {
    const inputValues = transformSubmitValues({
      definition,
      values: { ...getCleanedValues(), ...targetValues[getKeyForItem(item)] },
      autofillNotCollected: true,
      autofillNulls: true,
      autofillBooleans: false,
    });
    const input = getInputFromItem(inputValues, item);

    mutateFunction({ variables: input });
  };

  return (
    <Stack gap={2}>
      {title}
      {renderFields({
        // errors,
        // warnings,
      })}
      {!isEmpty(errors) &&
        errors?.map((e) => (
          <Alert key={e.id} severity='error'>
            {e.fullMessage}
          </Alert>
        ))}
      {!isEmpty(warnings) &&
        warnings?.map((e) => (
          <Alert key={e.id} severity='warning'>
            {e.fullMessage}
          </Alert>
        ))}
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
              getNode: (target, fieldProps) => (
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
                  {...props}
                  {...fieldProps}
                  inputProps={{
                    ...buildCommonInputProps(item, values),
                    ...fieldProps?.inputProps,
                  }}
                />
              ),
            })),
            { onSelect: handleSelect, mutationLoading }
          )}
      </Paper>
    </Stack>
  );
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
