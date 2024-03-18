import { isDate } from 'date-fns';
import { isNil } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatDateForGql, parseHmisDateString } from '@/modules/hmis/hmisUtil';

// adapted from https://github.com/jschwindt/react-use-search-params-state/tree/main

type DefaultType =
  | string
  | number
  | boolean
  | Array<string | number | boolean>
  | Date
  | null;

type SearchParamStateType = {
  type: 'string' | 'number' | 'boolean' | 'date';
  default: DefaultType;
  multiple?: boolean;
};

export type SearchParamsStateType = Record<string, SearchParamStateType>;

const paramToBool = (
  paramName: string,
  paramDefinition: SearchParamStateType,
  searchParams: URLSearchParams
) => {
  const paramValue = searchParams.get(paramName);
  // The only presence of a boolean param (value === '') is considered true
  if (paramValue === 'true' || paramValue === '1' || paramValue === '')
    return true;
  if (paramValue === 'false' || paramValue === '0') return false;

  return paramDefinition.default;
};

const paramToDate = (
  paramName: string,
  paramDefinition: SearchParamStateType,
  searchParams: URLSearchParams
) => {
  const paramValue = searchParams.get(paramName);
  return parseHmisDateString(paramValue) || paramDefinition.default;
};

const paramToValue = (
  paramName: string,
  paramDefinition: SearchParamStateType,
  searchParams: URLSearchParams
) => {
  if (paramDefinition.multiple) {
    const paramValue = searchParams.getAll(paramName);
    if (paramValue.length > 0) {
      return paramDefinition.type === 'number'
        ? paramValue.map((value) => Number(value))
        : paramValue;
    }
  } else {
    const paramValue = searchParams.get(paramName);
    if (paramValue) {
      return paramDefinition.type === 'number'
        ? Number(paramValue)
        : paramValue;
    }
  }
  return paramDefinition.default;
};

const getValues = (
  paramsDefinition: SearchParamsStateType,
  searchParams: URLSearchParams
) => {
  const values: any = {};
  for (const [paramName, paramDefinition] of Object.entries(paramsDefinition)) {
    if (paramDefinition.type === 'boolean') {
      values[paramName] = paramToBool(paramName, paramDefinition, searchParams);
    } else if (paramDefinition.type === 'date') {
      values[paramName] = paramToDate(paramName, paramDefinition, searchParams);
    } else {
      values[paramName] = paramToValue(
        paramName,
        paramDefinition,
        searchParams
      );
    }
  }
  return values;
};

const getAllCurrentParams = (searchParams: URLSearchParams) => {
  const allUrlParams: Record<string, any> = {};
  searchParams.forEach((value, key) => {
    if (allUrlParams[key]) {
      if (Array.isArray(allUrlParams[key])) {
        allUrlParams[key].push(value);
      } else {
        allUrlParams[key] = [allUrlParams[key], value];
      }
    } else {
      allUrlParams[key] = value;
    }
  });
  return allUrlParams;
};

const useSearchParamsState = (paramsDefinition: SearchParamsStateType) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const values = useMemo(
    () => getValues(paramsDefinition, searchParams),
    [paramsDefinition, searchParams]
  );

  const setValues = useCallback(
    (newValues: Record<string, any>) => {
      const currentParams = getAllCurrentParams(searchParams);
      for (const key in newValues) {
        if (Object.prototype.hasOwnProperty.call(newValues, key)) {
          let value = newValues[key];

          if (paramsDefinition[key].type === 'date' && isDate(value)) {
            // serialize date. if it is invalid, it will be null
            value = newValues[key] = formatDateForGql(value);
          }
          if (
            isNil(value) ||
            value === '' ||
            (Array.isArray(value) && value.length === 0)
          ) {
            delete currentParams[key];
            delete newValues[key];
          }
        }
      }
      setSearchParams({ ...currentParams, ...newValues });
    },
    [paramsDefinition, searchParams, setSearchParams]
  );

  return [values, setValues] as const;
};
export default useSearchParamsState;
