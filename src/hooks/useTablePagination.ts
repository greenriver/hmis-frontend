import { useCallback, useMemo } from 'react';

import useSearchParamsState from '@/hooks/useSearchParamState';
import { DEFAULT_TABLE_PAGE_SIZE } from '@/modules/dataFetching/constants';

// Shared defaults keep table pagination URLs consistent unless a page needs custom param names.
const DEFAULT_PAGE_PARAM = 'page';
const DEFAULT_PAGE_SIZE_PARAM = 'pageSize';

type Args = {
  defaultPageSize?: number;
  pageParam?: string;
  pageSizeParam?: string;
};

export type TablePaginationState = {
  /** 0-indexed page value used by MUI pagination and table query offsets. */
  page: number;
  rowsPerPage: number;
  setPage: (page: number) => void;
  setRowsPerPage: (rowsPerPage: number) => void;
};

// URL params are user-editable, so normalize anything invalid before using it for offsets.
const positiveIntegerOrDefault = (value: unknown, defaultValue: number) => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    return defaultValue;
  }

  return value;
};

const useTablePagination = ({
  defaultPageSize = DEFAULT_TABLE_PAGE_SIZE,
  pageParam = DEFAULT_PAGE_PARAM,
  pageSizeParam = DEFAULT_PAGE_SIZE_PARAM,
}: Args = {}): TablePaginationState => {
  // Define the URL-backed keys that this hook owns. Other query params are preserved by useSearchParamsState.
  const paramsDefinition = useMemo(
    () => ({
      [pageParam]: {
        type: 'number' as const,
        default: 1,
      },
      [pageSizeParam]: {
        type: 'number' as const,
        default: defaultPageSize,
      },
    }),
    [defaultPageSize, pageParam, pageSizeParam]
  );

  // Populate missing params on first load so refresh/share links include the active pagination state.
  const [paginationParams, setPaginationParams] = useSearchParamsState({
    paramsDefinition,
    initial: {
      [pageParam]: 1,
      [pageSizeParam]: defaultPageSize,
    },
  });

  // Convert the human-readable 1-indexed URL page into the 0-indexed value used by table components.
  const urlPage = positiveIntegerOrDefault(paginationParams[pageParam], 1);
  const rowsPerPage = positiveIntegerOrDefault(
    paginationParams[pageSizeParam],
    defaultPageSize
  );
  const page = urlPage - 1;

  const setPage = useCallback(
    (newPage: number) => {
      // Table controls provide 0-indexed pages; store 1-indexed pages in the URL.
      setPaginationParams((currentParams) => ({
        ...currentParams,
        [pageParam]: Math.max(newPage + 1, 1),
      }));
    },
    [pageParam, setPaginationParams]
  );

  const setRowsPerPage = useCallback(
    (newRowsPerPage: number) => {
      // Changing page size changes the offset meaning, so return to the first page.
      const nextRowsPerPage = positiveIntegerOrDefault(
        newRowsPerPage,
        defaultPageSize
      );

      setPaginationParams((currentParams) => ({
        ...currentParams,
        [pageParam]: 1,
        [pageSizeParam]: nextRowsPerPage,
      }));
    },
    [defaultPageSize, pageParam, pageSizeParam, setPaginationParams]
  );

  return {
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
  };
};

export default useTablePagination;
