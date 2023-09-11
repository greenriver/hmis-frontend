import { fromPairs, omitBy, uniq, pick, isEmpty, compact } from 'lodash-es';
import React, {
  useCallback,
  createContext,
  Dispatch,
  useReducer,
  PropsWithChildren,
  Reducer,
  useMemo,
} from 'react';
import { FormValues } from '../types';
import {
  getItemMap,
  hasMeaningfulValue,
  isDataNotCollected,
} from '../util/formUtil';
import { ErrorState } from '@/modules/errors/util';
import { FormDefinitionJson, ItemType } from '@/types/gqlTypes';

export type FromStepperSectionState = {
  errors: ErrorState;
  formErrors: {
    warnings: { linkId: string; message?: string }[];
    errors: { linkId: string; message?: string }[];
  };
  changed: string[];
  complete: boolean;
};
export type FormStepperStateType = Record<string, FromStepperSectionState>;
export type FormStepperActionType =
  | { type: 'changeField'; field: string }
  | { type: 'changeFields'; fields: string[] }
  | { type: 'updateValues'; values: FormValues }
  | { type: 'saveForm' }
  | { type: 'updateErrors'; errors?: ErrorState }
  | { type: 'validateForm'; values: FormValues };
export type FormStepperDispatchContextType = Dispatch<FormStepperActionType>;

export const FormStepperStateContext = createContext<FormStepperStateType>({});
export const FormStepperDispatchContext =
  createContext<FormStepperDispatchContextType>(() => {});

export type FormStepperContextProviderProps = {
  errors?: ErrorState;
  definition: FormDefinitionJson;
};

const FormStepperContextProvider: React.FC<
  PropsWithChildren<FormStepperContextProviderProps>
> = ({
  // TODO: Allow initial errors if needed
  definition,
  children,
}) => {
  const fieldMap = useMemo(
    () =>
      fromPairs(
        definition.item.map((item) => [
          item.linkId,
          getItemMap({ item: item.item || [] }),
        ])
      ),
    [definition]
  );

  const reverseFieldMap = useMemo(
    () =>
      Object.entries(fieldMap).reduce(
        (acc: Record<string, string>, [key, fields]) => ({
          ...acc,
          ...fromPairs(Object.keys(fields).map((f) => [f, key])),
        }),
        {}
      ),
    [fieldMap]
  );

  const applyFieldChange = useCallback(
    (prevState: FormStepperStateType, field: string) => {
      const group = reverseFieldMap[field];
      if (!group) return prevState;

      return {
        ...prevState,
        [group]: {
          complete: prevState[group]?.complete || false,
          formErrors: prevState[group]?.formErrors || {
            errors: [],
            warnings: [],
          },
          errors: prevState[group]?.errors || { errors: [], warnings: [] },
          changed: uniq([...(prevState[group]?.changed || []), field]),
        },
      };
    },
    [reverseFieldMap]
  );

  const applyErrorsChange = useCallback(
    (prevState: FormStepperStateType, errors: ErrorState) =>
      fromPairs(
        Object.entries(fieldMap).map(([group, items]) => {
          const groupKeys = Object.keys(items);
          const groupAttributes = compact(
            Object.values(items).map((item) => item.mapping?.fieldName)
          );

          const filteredErrors: ErrorState = {
            errors: errors.errors.filter(
              (err) =>
                groupKeys.includes(err.linkId || '') ||
                groupAttributes.includes(err.attribute)
            ),
            warnings: errors.warnings.filter(
              (err) =>
                groupKeys.includes(err.linkId || '') ||
                groupAttributes.includes(err.attribute)
            ),
          };

          return [
            group,
            {
              changed: prevState[group]?.changed || [],
              formErrors: prevState[group]?.formErrors || {
                errors: [],
                warnings: [],
              },
              errors: filteredErrors,
              complete: prevState[group]?.complete || false,
            },
          ];
        })
      ),
    [fieldMap]
  );

  const applyFormValidationErrors = useCallback(
    (prevState: FormStepperStateType, values: FormValues) =>
      fromPairs(
        Object.entries(fieldMap).map(([group, items]) => {
          const filteredValues: FormValues = pick(values, Object.keys(items));

          const errors: FromStepperSectionState['formErrors'] = {
            errors: [],
            warnings: [],
          };

          Object.entries(items).forEach(([linkId, item]) => {
            const value = filteredValues[linkId];
            if (!(linkId in filteredValues)) return;

            if (item.required && !hasMeaningfulValue(value))
              errors.errors.push({ linkId, message: 'required' });
            if (item.warnIfEmpty && !hasMeaningfulValue(value))
              errors.warnings.push({ linkId, message: 'required' });
          });

          return [
            group,
            {
              formErrors: errors,
              changed: prevState[group]?.changed || [],
              errors: prevState[group]?.errors || [],
              complete: prevState[group]?.complete || false,
            },
          ];
        })
      ),
    [fieldMap]
  );

  const applyValuesForCompletion = useCallback(
    (prevState: FormStepperStateType, values: FormValues) =>
      fromPairs(
        Object.entries(fieldMap).map(([group, items]) => {
          const filteredItems = omitBy(
            items,
            (item) => item.type === ItemType.Display
          );
          const filteredValues: FormValues = pick(
            values,
            Object.keys(filteredItems)
          );

          return [
            group,
            {
              changed: prevState[group]?.changed || [],
              errors: prevState[group]?.errors || {},
              formErrors: prevState[group]?.formErrors || {
                errors: [],
                warnings: [],
              },
              complete:
                !isEmpty(filteredValues) &&
                Object.values(filteredValues).every(
                  // Currently hasMeaningfulValue includes isDataNotCollected, but that may be removed, so handle it here explicitly
                  (val) => hasMeaningfulValue(val) && !isDataNotCollected(val)
                ),
            },
          ];
        })
      ),
    [fieldMap]
  );

  const reducer: Reducer<FormStepperStateType, FormStepperActionType> =
    useCallback(
      (state: FormStepperStateType, action: FormStepperActionType) => {
        switch (action.type) {
          case 'changeField':
            return applyFieldChange(state, action.field);
          case 'changeFields':
            let next = state;
            for (const field in action.fields) {
              next = applyFieldChange(next, field);
            }
            return next;
          case 'updateValues':
            // return applyFormValidationErrors(applyValuesForCompletion(state, action.values), action.values);
            return applyValuesForCompletion(state, action.values);
          case 'saveForm':
            return fromPairs(
              Object.entries(state).map(([group, val]) => [
                group,
                { ...val, changed: [] },
              ])
            );
          case 'validateForm':
            return applyFormValidationErrors(state, action.values);
          case 'updateErrors':
            if (!action.errors) return state;
            return applyErrorsChange(state, action.errors);
          default:
            return state;
        }
      },
      [
        applyFieldChange,
        applyErrorsChange,
        applyValuesForCompletion,
        applyFormValidationErrors,
      ]
    );

  const [state, dispatch] = useReducer(reducer, {});

  return (
    <FormStepperStateContext.Provider value={state}>
      <FormStepperDispatchContext.Provider value={dispatch}>
        {children}
      </FormStepperDispatchContext.Provider>
    </FormStepperStateContext.Provider>
  );
};

export default FormStepperContextProvider;
