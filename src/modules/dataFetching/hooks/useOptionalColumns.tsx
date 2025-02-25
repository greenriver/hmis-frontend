import { compact } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import { getColumnKey } from '@/components/elements/table/util';

export function useOptionalColumns<T extends { id: string }, QueryVariables>({
  columns,
}: {
  columns?: ColumnDef<T>[];
}) {
  // All the column definitions that are marked optional
  const optionalColumns = useMemo(
    () => (columns || []).filter((col) => col.optional),
    [columns]
  );

  // (Internal to this hook) Which optional column defs are currently included
  const [currentOptColDefs, setCurrentOptColDefs] = useState<ColumnDef<T>[]>(
    compact(optionalColumns.filter((col) => !col.optional?.defaultHidden) || [])
  );

  // Map currently included optional column defs to their keys...
  const includedOptionalColumns = useMemo(
    () => currentOptColDefs.map((c) => getColumnKey(c)),
    [currentOptColDefs]
  );

  // ...and map them back again
  const setIncludedOptionalColumns = useCallback(
    (columnKeys: string[]) => {
      const cols = columns?.filter((c) => columnKeys.includes(getColumnKey(c)));
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
