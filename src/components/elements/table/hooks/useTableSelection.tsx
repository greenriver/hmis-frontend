import { without } from 'lodash-es';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useTableSelection<T extends { id: string }>({
  selectable = false,
  isRowSelectable,
  rows,
  selectedControlled,
  onChangeSelected,
}: {
  selectable?: boolean;
  isRowSelectable?: (row: T) => boolean;
  rows: T[];
  selectedControlled?: readonly string[];
  onChangeSelected?: (ids: readonly string[]) => void;
}) {
  // Initially set selected to undefined, so we can early return and avoid state flicker
  const [selectedState, setSelectedState] = useState<string[]>();

  // Table row selection can be either controlled or uncontrolled:
  // - controlled: `selectedCtrl` and `onChangeSelectedCtrl` props passed from parent
  // - uncontrolled: managed internally in `selectedState`
  const isSelectControlled = selectedControlled !== undefined;

  const selected = useMemo(
    () => (isSelectControlled ? selectedControlled : selectedState || []),
    [isSelectControlled, selectedState, selectedControlled]
  );

  const selectableRowIds = useMemo(() => {
    if (!selectable) return [];
    if (!isRowSelectable) return rows.map((r) => r.id);
    return rows.filter(isRowSelectable).map((r) => r.id);
  }, [rows, selectable, isRowSelectable]);

  const handleSelectAllClick = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        // select all
        if (!isSelectControlled) setSelectedState(selectableRowIds);
        onChangeSelected?.(selectableRowIds);
      } else {
        // deselect all
        if (!isSelectControlled) setSelectedState([]);
        onChangeSelected?.([]);
      }
    },
    [isSelectControlled, onChangeSelected, selectableRowIds]
  );

  const handleSelectRow = useCallback(
    (row: T) => {
      const newValue = selected.includes(row.id)
        ? without(selected, row.id)
        : [...selected, row.id];

      if (!isSelectControlled) setSelectedState(newValue);
      onChangeSelected?.(newValue);
    },
    [isSelectControlled, onChangeSelected, selected]
  );

  // Clear selection when data changes
  useEffect(() => setSelectedState([]), [rows]);

  return {
    selected,
    selectableRowIds,
    handleSelectAllClick,
    handleSelectRow,
  };
}
