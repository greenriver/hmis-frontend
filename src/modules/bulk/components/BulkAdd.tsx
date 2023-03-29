import { TypedDocumentNode, useMutation } from '@apollo/client';
import { Alert, Paper } from '@mui/material';
import { Stack } from '@mui/system';
import { isEmpty } from 'lodash-es';
import { ReactNode, useMemo, useState } from 'react';

import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/404';
import DynamicField from '@/modules/form/components/DynamicField';
import ValidationErrorDisplay from '@/modules/form/components/ValidationErrorDisplay';
import useDynamicFormFields from '@/modules/form/hooks/useDynamicFormFields';
import { DynamicFieldProps } from '@/modules/form/types';
import {
  buildCommonInputProps,
  extractClientItemsFromDefinition,
  FormValues,
  LocalConstants,
  transformSubmitValues,
} from '@/modules/form/util/formUtil';
import {
  FormDefinitionJson,
  FormItem,
  FormRole,
  useGetFormDefinitionQuery,
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
    // TODO: update this to just call `SubmitForm`
    const inputValues = transformSubmitValues({
      definition,
      values: {
        ...getCleanedValues(),
        ...targetValues[getKeyForTarget(target)],
      },
      autofillNotCollected: true,
      includeMissingKeys: 'AS_NULL',
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
      {renderFields({})}
      {errors && !isEmpty(errors) && (
        <Alert key='errors' severity='error' sx={{ mb: 2 }}>
          <ValidationErrorDisplay errors={errors} />
        </Alert>
      )}
      {warnings && !isEmpty(warnings) && (
        <Alert key='warnings' severity='warning'>
          <ValidationErrorDisplay errors={warnings} />
        </Alert>
      )}
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
                  itemChanged={({ linkId, value }) =>
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
    formRole: FormRole;
  }
) => {
  const { formRole } = props;

  const { data, loading } = useGetFormDefinitionQuery({
    variables: { role: formRole },
  });

  const definition = data?.getFormDefinition?.definition;

  if (loading) return <Loading />;
  if (!definition) return <NotFound />;

  return <BulkAdd {...props} definition={definition} />;
};

export default BulkAddWrapper;
