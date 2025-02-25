import { compact } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import useCurrentPath from '@/hooks/useCurrentPath';
import useSearchParamsState from '@/hooks/useSearchParamState';
import {
  getStoredPathParams,
  setStoredPathParams,
} from '@/modules/auth/api/storage';
import { GenericTableWithDataColumnDef } from '@/modules/dataFetching/types';

export function useOptionalColumns<T extends { id: string }, QueryVariables>({
  columns,
}: {
  columns?: GenericTableWithDataColumnDef<T, QueryVariables>[];
}) {
  // All the column definitions that are marked optional
  const optionalColumns = useMemo(
    () => (columns || []).filter((col) => !!col.optional),
    [columns]
  );

  const currentPath = useCurrentPath();

  const initialOptionalColumns = useMemo(() => {
    const storedOptionalCols = currentPath
      ? getStoredPathParams(currentPath)?.optionalColumns
      : undefined;

    // If local storage has optional columns for this path, return them
    if (storedOptionalCols) return storedOptionalCols;

    // Otherwise, default to any optional columns that are not defaultHidden
    return compact(
      columns
        ?.filter((col) => !col.optional?.defaultHidden)
        .map((col) => col.key) || []
    );
  }, [columns, currentPath]);

  // Store optional column state in BOTH search params and local storage.
  // This is so that users can both
  // - get the same view on their data every time they visit a table
  // - and share/bookmark URLs that keep the same view into the data.
  const [paramValues, setParamValues] = useSearchParamsState(
    {
      optionalColumns: {
        type: 'string',
        multiple: true,
        default: initialOptionalColumns, // todo @martha - make this 'initial', not 'default'
      },
    },
    true
  );

  // todo @martha - naming to avoid confusion
  const setIncludedOptionalColumns = useCallback(
    (optionalColumns: string[]) => {
      // Store in both local storage and search params
      if (currentPath) {
        setStoredPathParams(currentPath, { optionalColumns });
      }
      setParamValues({ optionalColumns });
    },
    [currentPath, setParamValues]
  );

  const includedOptionalColumns = useMemo(
    () => paramValues.optionalColumns,
    [paramValues]
  );

  // (internal) currently included optional columns
  const includedOptionalColumnDefs = useMemo(
    () =>
      optionalColumns.filter((c) => includedOptionalColumns.includes(c.key)),
    [optionalColumns, includedOptionalColumns]
  );

  // Based on the currently shown optional columns, get the optional query variables that should be included
  const optionalQueryVariables: Partial<QueryVariables> = useMemo(() => {
    const queryVariableFields = compact(
      includedOptionalColumnDefs.map((c) => c.optional?.queryVariableField)
    );
    return queryVariableFields.reduce((acc: any, key) => {
      acc[key] = true;
      return acc as QueryVariables;
    }, {});
  }, [includedOptionalColumnDefs]);

  return {
    optionalColumns,
    includedOptionalColumns,
    setIncludedOptionalColumns,
    optionalQueryVariables,
  };
}
