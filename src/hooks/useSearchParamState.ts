import { isDate } from 'date-fns';
import { isNil } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
  const values: Record<string, any> = {};
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

const populateParams = (
  params: Record<string, any>,
  searchParams: URLSearchParams
) => {
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => searchParams.append(key, v));
    } else {
      if (!!value) searchParams.set(key, value);
    }
  });
};

// Type for internal state representation of search params
type ValueType = Record<string, any>; // Future improvement: constrain value type

type Args = {
  paramsDefinition: SearchParamsStateType; // shape of params/state
  initial?: ValueType;
};

// Returns state and setState function
type ReturnType = [ValueType, (value: ValueType) => void];

const useSearchParamsState = ({
  paramsDefinition,
  initial,
}: Args): ReturnType => {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();

  // `initial` is NOT passed to `useSearchParams` here, since react-router-dom's
  // useSearchParams's `defaultInit` prop auto-populates the internal state, but not
  // the search params that appear in the url. See the useEffect below
  const [searchParams, setSearchParams] = useSearchParams();

  const [mounted, setMounted] = useState(false);

  // Use an effect to set the `initial` params in the url bar. This could be avoided
  // if we transitioned to createBrowserRouter and used route `loader`s, but that's a big lift,
  // and would need to be configured on every route that uses optional columns.
  useEffect(() => {
    setMounted(true);

    if (!initial || Object.keys(initial).length === 0) return;

    const accumulator = new URLSearchParams();
    populateParams(initial, accumulator);
    if (accumulator.size === 0) return;

    // Add currentParams to avoid overwriting params set by other components
    const currentParams = getAllCurrentParams(searchParams);
    populateParams(currentParams, accumulator);

    navigate(
      {
        pathname,
        hash,
        search: accumulator.toString(),
      },
      { replace: true }
    ); // replace so that this doesn't create a new entry in browser history

    // Only run on mount, otherwise the effect prevents the user from overwriting initial values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const values = useMemo(() => {
    if (initial && !mounted) {
      // If the above useEffect hasn't run yet, return the initial values right away
      // to avoid flickering
      return initial;
    }
    return getValues(paramsDefinition, searchParams);
  }, [initial, mounted, paramsDefinition, searchParams]);

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
  return [values, setValues];
};
export default useSearchParamsState;
