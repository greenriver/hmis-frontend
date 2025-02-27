import { compact } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { DataColumnDef } from '@/modules/dataFetching/types';

export function useOptionalColumns<T extends { id: string }, QueryVariables>({
  columns,
}: {
  columns?: DataColumnDef<T, QueryVariables>[];
}) {
  // All the column definitions that are marked optional
  const optionalColumns = useMemo(
    () => (columns || []).filter((col) => col.optional),
    [columns]
  );

  // (Internal to this hook) Which optional column defs are currently shown
  const [currentOptColDefs, setCurrentOptColDefs] = useState<
    DataColumnDef<T, QueryVariables>[]
  >(
    compact(optionalColumns.filter((col) => !col.optional?.defaultHidden) || [])
  );

  // Map currently shown optional column defs to their keys...
  const includedOptionalColumns = useMemo(
    () => currentOptColDefs.map((c) => c.key),
    [currentOptColDefs]
  );

  // ...and map them back again
  const setIncludedOptionalColumns = useCallback(
    (columnKeys: string[]) => {
      const cols = columns?.filter((c) => columnKeys.includes(c.key));
      setCurrentOptColDefs(cols || []);
    },
    [columns]
  );

  // Based on the currently shown optional columns, get the optional query variables that should be included
  const optionalQueryVariables = useMemo(() => {
    const queryVariableFields = compact(
      currentOptColDefs.map((c) => c.optional?.queryVariableField)
    );
    return queryVariableFields.reduce((acc: any, key) => {
      acc[key] = true;
      return acc as QueryVariables;
    }, {});
  }, [currentOptColDefs]);

  return {
    optionalColumns,
    includedOptionalColumns,
    setIncludedOptionalColumns,
    optionalQueryVariables,
  };
}
