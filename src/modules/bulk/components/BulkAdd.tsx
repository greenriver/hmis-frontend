import { TypedDocumentNode, useMutation } from '@apollo/client';
import { Alert, Paper } from '@mui/material';
import { Stack } from '@mui/system';
import { isEmpty } from 'lodash-es';
import { ReactNode, useMemo, useState } from 'react';

import Loading from '@/components/elements/Loading';
import DynamicField, {
  DynamicFieldProps,
} from '@/modules/form/components/DynamicField';
import useDynamicFormFields from '@/modules/form/hooks/useDynamicFormFields';
import {
  buildCommonInputProps,
  extractClientItemsFromDefinition,
  FormValues,
  LocalConstants,
} from '@/modules/form/util/formUtil';
import { transformSubmitValues } from '@/modules/form/util/recordFormUtil';
import {
  FormDefinitionJson,
  FormItem,
  useGetFormDefinitionByIdentifierQuery,
  ValidationError,
  ValidationSeverity,
} from '@/types/gqlTypes';

export interface RenderListOptions<TargetType> {
  onSelect: (target: TargetType) => void;
  mutationLoading?: boolean;
  values?: FormValues;
}

export interface Props<TargetType, Query, QueryVariables> {
  definition: FormDefinitionJson;
  mutationDocument: TypedDocumentNode<Query, QueryVariables>;
  inputVariables?: Record<string, any>;
  localConstants?: LocalConstants;
  renderList?: (
    targets: {
      getNode: (
        target: TargetType,
        props?: Partial<DynamicFieldProps>
      ) => ReactNode;
      item: FormItem;
      label?: string | null | undefined;
    }[],
    options: RenderListOptions<TargetType>
  ) => React.ReactNode;
  onCompleted?: (target: TargetType, data: Query) => void;
  onSuccess?: (target: TargetType, data: Query) => void;
  onError?: (target: TargetType, errors: ValidationError[]) => void;
  getErrors: (data: Query) => ValidationError[] | undefined;
  getKeyForTarget: (target: TargetType) => string;
  getInputFromTarget: (
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
    renderList,
    onCompleted,
    onSuccess,
    onError,
    getErrors,
    getInputFromTarget,
    getKeyForTarget,
    title,
  } = props;
  const [errors, setErrors] = useState<ValidationError[] | undefined>();
  const [warnings, setWarnings] = useState<ValidationError[] | undefined>();

  const [targetValues, setTargetValues] = useState<Record<string, FormValues>>(
    {}
  );

  const allTargetItems = useMemo(
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
  >(mutationDocument);

  const handleSelect: RenderListOptions<TargetType>['onSelect'] = (target) => {
    const inputValues = transformSubmitValues({
      definition,
      values: {
        ...getCleanedValues(),
        ...targetValues[getKeyForTarget(target)],
      },
      autofillNotCollected: true,
      autofillNulls: true,
      autofillBooleans: false,
      keyByFieldName: true,
    });
    const input = getInputFromTarget(inputValues, target);

    return mutateFunction({
      variables: input,
      onCompleted: (data) => {
        const errors = getErrors(data) || [];

        if (errors.length > 0) {
          const warnings = errors.filter(
            (e) => e.severity === ValidationSeverity.Warning
          );
          const validationErrors = errors.filter(
            (e) => e.severity !== ValidationSeverity.Warning
          );
          if (validationErrors.length > 0) window.scrollTo(0, 0);
          setWarnings(warnings);
          setErrors(validationErrors);
          if (onError) onError(target, validationErrors);
        } else {
          if (onSuccess) onSuccess(target, data);
          setWarnings([]);
          setErrors([]);
        }
        if (onCompleted) onCompleted(target, data);
      },
    });
  };

  return (
    <Stack gap={2}>
      {title}
      {renderFields({
        // errors,
        // warnings,
      })}
      {!isEmpty(errors) &&
        errors?.map((e, i) => (
          <Alert key={i} severity='error'>
            {e.fullMessage}
          </Alert>
        ))}
      {!isEmpty(warnings) &&
        warnings?.map((e, i) => (
          <Alert key={i} severity='warning'>
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
                      [getKeyForTarget(target)]: { [linkId]: value },
                    })
                  }
                  value={targetValues?.[getKeyForTarget(target)]?.[item.linkId]}
                  {...props}
                  {...fieldProps}
                  inputProps={{
                    ...buildCommonInputProps(item, values),
                    ...fieldProps?.inputProps,
                  }}
                />
              ),
            })),
            {
              onSelect: handleSelect,
              mutationLoading,
              values,
            }
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

  const { data, loading } = useGetFormDefinitionByIdentifierQuery({
    variables: { identifier: definitionIdentifier },
  });

  const definition = data?.formDefinition?.definition;

  if (loading) return <Loading />;
  if (!definition) throw Error('Definition not found');

  return <BulkAdd {...props} definition={definition} />;
};

export default BulkAddWrapper;
