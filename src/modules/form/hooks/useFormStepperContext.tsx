import { fromPairs, omitBy, uniq, pick, isEmpty } from 'lodash-es';
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
  changed: string[];
  complete: boolean;
};
export type FormStepperStateType = Record<string, FromStepperSectionState>;
export type FormStepperActionType =
  | { type: 'changeField'; field: string }
  | { type: 'changeFields'; fields: string[] }
  | { type: 'updateValues'; values: FormValues }
  | { type: 'saveForm' }
  | { type: 'updateErrors'; errors?: ErrorState };
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
          const filteredErrors: ErrorState = {
            errors: errors.errors.filter((err) =>
              Object.keys(items).includes(err.linkId || '')
            ),
            warnings: errors.warnings.filter((err) =>
              Object.keys(items).includes(err.linkId || '')
            ),
          };

          return [
            group,
            {
              changed: prevState[group]?.changed || [],
              errors: filteredErrors,
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
              complete:
                !isEmpty(filteredValues) &&
                Object.values(filteredValues).every(
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
            return applyValuesForCompletion(state, action.values);
          case 'saveForm':
            return fromPairs(
              Object.entries(state).map(([group, val]) => [
                group,
                { ...val, changed: [] },
              ])
            );
          case 'updateErrors':
            if (!action.errors) return state;
            return applyErrorsChange(state, action.errors);
        }
      },
      [applyFieldChange, applyErrorsChange, applyValuesForCompletion]
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
