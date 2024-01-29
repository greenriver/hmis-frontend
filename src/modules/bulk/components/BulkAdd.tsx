import { TypedDocumentNode, useMutation } from '@apollo/client';
import { Paper } from '@mui/material';
import { Stack } from '@mui/system';
import { ReactNode, useMemo, useState } from 'react';
import { useWatch } from 'react-hook-form';

import Loading from '@/components/elements/Loading';
import NotFound from '@/components/pages/NotFound';
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
import DynamicFormFields from '@/modules/form/components/DynamicFormFields';
import useFormDefinitionHandlers from '@/modules/form/hooks/useFormDefinitionHandlers';
import useServiceFormDefinition from '@/modules/form/hooks/useServiceFormDefinition';
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

  const handlers = useFormDefinitionHandlers({
    definition,
    localConstants: props.localConstants,
  });

  const { getCleanedValues, isItemDisabled } = handlers;

  useWatch({ control: handlers.methods.control });
  const values = getCleanedValues();

  const targetItems = useMemo(
    () => allTargetItems.filter((item) => !isItemDisabled(item)),
    [allTargetItems, isItemDisabled]
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
      <DynamicFormFields handlers={handlers} bulk />
      {errors && hasAnyValue(errors) && (
        <Stack gap={1} sx={{ mt: 4 }}>
          <ApolloErrorAlert error={errors.apolloError} />
          <ErrorAlert key='errors' errors={errors.errors} />
          <WarningAlert key='warnings' warnings={errors.warnings} />
        </Stack>
      )}
      <Paper>
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
                    ...buildCommonInputProps({
                      item,
                      values,
                      localConstants: props.localConstants || {},
                    }),
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
    serviceTypeId: string;
    projectId: string;
  }
) => {
  const { serviceTypeId, projectId } = props;

  const { formDefinition, loading } = useServiceFormDefinition({
    projectId,
    serviceTypeId,
  });

  if (loading) return <Loading />;
  if (!formDefinition) return <NotFound />;

  return <BulkAdd {...props} definition={formDefinition.definition} />;
};

export default BulkAddWrapper;
