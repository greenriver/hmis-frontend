import { without } from 'lodash-es';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  // - controlled: `selectedControlled` and `onChangeSelected` props passed from parent
  // - uncontrolled: managed internally in `selectedState`,
  // (but we still call `onChangeSelected` so the caller can "listen in" on what rows are selected)
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

  const deselectAll = useCallback(() => {
    if (!isSelectControlled) setSelectedState([]);
    onChangeSelected?.([]);
  }, [isSelectControlled, onChangeSelected]);

  const handleSelectAllClick = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        // select all
        if (!isSelectControlled) setSelectedState(selectableRowIds);
        onChangeSelected?.(selectableRowIds);
      } else {
        // deselect all
        deselectAll();
      }
    },
    [deselectAll, isSelectControlled, onChangeSelected, selectableRowIds]
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

  // Clear selection when `rows` change (but not in initial render)
  const didMountRef = useRef(false);
  useEffect(() => {
    if (didMountRef.current) {
      deselectAll();
    } else {
      didMountRef.current = true; // first render
    }
  }, [deselectAll, rows]);

  return {
    selected,
    selectableRowIds,
    handleSelectAllClick,
    handleSelectRow,
  };
}
