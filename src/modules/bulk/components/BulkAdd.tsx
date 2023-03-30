import { TypedDocumentNode, useMutation } from '@apollo/client';
import { Paper } from '@mui/material';
import { Stack } from '@mui/system';
import { ReactNode, useMemo, useState } from 'react';

import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/404';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import WarningAlert from '@/modules/errors/components/WarningAlert';
import {
  emptyErrorState,
  ErrorState,
  hasAnyValue,
  partitionValidations,
} from '@/modules/errors/util';
import DynamicField from '@/modules/form/components/DynamicField';
import useDynamicFormFields from '@/modules/form/hooks/useDynamicFormFields';
import {
  DynamicFieldProps,
  FormValues,
  LocalConstants,
} from '@/modules/form/types';
import {
  buildCommonInputProps,
  extractClientItemsFromDefinition,
  transformSubmitValues,
} from '@/modules/form/util/formUtil';
import {
  FormDefinitionJson,
  FormItem,
  FormRole,
  useGetFormDefinitionQuery,
  ValidationError,
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
  const [errors, setErrors] = useState<ErrorState>(emptyErrorState);

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
          window.scrollTo(0, 0);
          setErrors(partitionValidations(errors));
          if (onError) onError(target, errors);
        } else {
          if (onSuccess) onSuccess(target, data);
          setErrors(emptyErrorState);
        }
        if (onCompleted) onCompleted(target, data);
      },
      onError: (apolloError) => setErrors({ ...emptyErrorState, apolloError }),
    });
  };

  return (
    <Stack gap={2}>
      {title}
      {renderFields({})}
      {errors && hasAnyValue(errors) && (
        <Stack gap={1} sx={{ mt: 4 }}>
          <ApolloErrorAlert error={errors.apolloError} />
          <ErrorAlert key='errors' errors={errors.errors} fixable={false} />
          <WarningAlert key='warnings' warnings={errors.warnings} />
        </Stack>
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
