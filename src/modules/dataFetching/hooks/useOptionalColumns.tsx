import { compact } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { TableColumnsMenuProps } from '@/components/elements/tableFilters/filters/ColumnsMenu';
import useCurrentPath from '@/hooks/useCurrentPath';
import useSearchParamsState from '@/hooks/useSearchParamState';
import {
  getStoredPathParams,
  setStoredPathParams,
} from '@/modules/auth/api/storage';
import { DataColumnDef } from '@/modules/dataFetching/types';

export function useOptionalColumns<T extends { id: string }, QueryVariables>({
  columns,
}: {
  columns?: DataColumnDef<T, QueryVariables>[];
}) {
  // All the column definitions that are marked optional
  const optionalColumns = useMemo(
    () => (columns || []).filter((col) => !!col.optional),
    [columns]
  );
  const optionalColumnKeys = useMemo(
    () => optionalColumns.map((col) => col.key),
    [optionalColumns]
  );

  // Optional columns that are not hidden by default
  const defaultOptionalColumns = useMemo(() => {
    return compact(
      optionalColumns
        .filter((col) => !col.optional?.defaultHidden)
        .map((col) => col.key) || []
    );
  }, [optionalColumns]);

  const currentPath = useCurrentPath();

  // Optional columns to show when the page first loads
  const initialOptionalColumns = useMemo(() => {
    if (optionalColumns.length === 0) {
      return [];
    }

    const storedOptionalCols = currentPath
      ? getStoredPathParams(currentPath)?.optionalColumns
      : undefined;

    // If local storage has optional columns for this path, return them.
    // Filter by optionalColumnKeys inclusion so we only return columns relevant to this table
    if (storedOptionalCols)
      return storedOptionalCols.filter((col: string) =>
        optionalColumnKeys.includes(col)
      );

    // Otherwise, default to any optional columns that are not defaultHidden
    return defaultOptionalColumns;
  }, [
    optionalColumns.length,
    currentPath,
    defaultOptionalColumns,
    optionalColumnKeys,
  ]);

  // Store currently selected optional columns in url search params
  const [paramValues, setParamValues] = useSearchParamsState({
    paramsDefinition: {
      optionalColumns: {
        type: 'string',
        multiple: true,
        default: [],
      },
    },
    initial: {
      optionalColumns: initialOptionalColumns,
    },
  });

  const includedOptionalColumns = useMemo(
    () => paramValues.optionalColumns,
    [paramValues]
  );

  const setIncludedOptionalColumns = useCallback(
    (optionalColumns: string[]) => {
      // Store selected optional columns in BOTH local storage and search params
      if (currentPath) {
        setStoredPathParams(currentPath, { optionalColumns });
      }
      setParamValues({ optionalColumns });
    },
    [currentPath, setParamValues]
  );

  // Based on the currently shown optional columns, get the optional query variables that should be included
  const optionalQueryVariables: Partial<QueryVariables> = useMemo(() => {
    const queryVariableFields = compact(
      optionalColumns
        .filter((c) => includedOptionalColumns.includes(c.key))
        .map((c) => c.optional?.queryVariableField)
    );

    return queryVariableFields.reduce((acc: any, key) => {
      acc[key] = true;
      return acc;
    }, {});
  }, [includedOptionalColumns, optionalColumns]);

  const optionalColumnsMenuProps: TableColumnsMenuProps | undefined =
    useMemo(() => {
      if (optionalColumns.length === 0) {
        return undefined;
      }
      return {
        columns: optionalColumns.map((col) => ({
          value: col.key,
          header: col.header,
          defaultHidden: !!col.optional?.defaultHidden,
        })),
        defaultColumns: defaultOptionalColumns,
        columnsValue: includedOptionalColumns,
        setColumnsValue: setIncludedOptionalColumns,
      };
    }, [
      defaultOptionalColumns,
      includedOptionalColumns,
      optionalColumns,
      setIncludedOptionalColumns,
    ]);

  return {
    optionalColumns,
    includedOptionalColumns,
    optionalQueryVariables,
    optionalColumnsMenuProps,
  };
}
