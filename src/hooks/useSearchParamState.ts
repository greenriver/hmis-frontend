import { isDate } from 'date-fns';
import { isNil } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  searchParams: URLSearchParams,
  emptyArrays: string[]
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
  if (emptyArrays.includes(paramName)) return [];
  return paramDefinition.default;
};

const getValues = (
  paramsDefinition: SearchParamsStateType,
  searchParams: URLSearchParams,
  emptyArrays: string[]
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
        searchParams,
        emptyArrays
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

/**
 * Works like useState but stores the state in URL search params. Adapted
 * from https://github.com/jschwindt/react-use-search-params-state/tree/main
 *
 * @param paramsDefinition maps search param names to their definitions,
 * indicating their type and default value
 * @param applyDefaults if true, on load apply the default values from
 * the paramsDefinition to the actual search params that appear the URL bar.
 */
const useSearchParamsState = (
  paramsDefinition: SearchParamsStateType,
  applyDefaults?: boolean
) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // `emptyArrays` is a hack to get around the fact that in URL search params,
  // empty arrays aren't distinguished from null/undefined values.
  // For SearchParamStateTypes where multiple is true _and_ there is a default value,
  // we need this workaround to be able to set the value to empty, instead of just always returning the default.
  const [emptyArrays, setEmptyArrays] = useState<string[]>([]);

  const values = useMemo(
    () => getValues(paramsDefinition, searchParams, emptyArrays),
    [emptyArrays, paramsDefinition, searchParams]
  );

  useEffect(() => {
    if (!applyDefaults) return;

    const toUpdate: Record<string, any> = Object.fromEntries(
      // Find any key/value pairs that are in values, but not in searchParams.
      // These are default values, so if applyDefaults flag is true, put them in searchParams.
      Object.entries(values).filter(([key]) => !searchParams.has(key))
    );

    if (Object.keys(toUpdate).length) setSearchParams(toUpdate);
  }, [applyDefaults, values, searchParams, setSearchParams]);

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

          if (isNil(value) || value === '') {
            delete currentParams[key];
            delete newValues[key];
          }
          if (Array.isArray(value) && value.length === 0) {
            // See comments above about setEmptyArrays
            setEmptyArrays([...emptyArrays, key]);
            delete currentParams[key];
            delete newValues[key];
          }
        }
      }
      setSearchParams({ ...currentParams, ...newValues });
    },
    [emptyArrays, paramsDefinition, searchParams, setSearchParams]
  );

  return [values, setValues] as const;
};
export default useSearchParamsState;
