import { compact } from 'lodash-es';
import { useCallback, useMemo, useState } from 'react';
import { ColumnDef } from '@/components/elements/table/types';
import { getColumnKey } from '@/components/elements/table/util';

export function useOptionalColumns<T extends { id: string }, QueryVariables>({
  columns,
}: {
  columns?: ColumnDef<T>[];
}) {
  const [currentOptCols, setCurrentOptCols] = useState<ColumnDef<T>[]>(
    compact(
      columns?.filter((col) => col.optional && !col.optional.defaultHidden) ||
        []
    )
  );

  const includedOptionalColumns = useMemo(
    () => currentOptCols.map((c) => getColumnKey(c)),
    [currentOptCols]
  );

  const setIncludedOptionalColumns = useCallback(
    (columnKeys: string[]) => {
      const cols = columns?.filter((c) => columnKeys.includes(getColumnKey(c)));
      setCurrentOptCols(cols || []);
    },
    [columns]
  );

  const optionalQueryVariables = useMemo(() => {
    const queryVariableFields = compact(
      currentOptCols.map((c) => c.optional?.queryVariableField)
    );
    return queryVariableFields.reduce((acc: any, key) => {
      acc[key] = true;
      return acc as QueryVariables;
    }, {});
  }, [currentOptCols]);

  return {
    includedOptionalColumns,
    setIncludedOptionalColumns,
    optionalQueryVariables,
  };
}
