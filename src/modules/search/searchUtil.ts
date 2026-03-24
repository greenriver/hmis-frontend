import { FormValues } from '../form/types';
import { SearchFormDefinition } from '@/modules/form/data';
import { ClientSearchInput, SearchQueryFieldsFragment } from '@/types/gqlTypes';

/**
 * Field names from `SearchQueryFields` that map to `ClientSearchInput`.
 * Used to map a loaded `SearchQuery` into form state and to prime Apollo cache after `SearchClients`.
 */
const SEARCH_QUERY_FIELD_NAMES = [
  'textSearch',
  'personalId',
  'warehouseId',
  'firstName',
  'lastName',
  'ssnSerial',
  'dob',
] as const satisfies ReadonlyArray<keyof ClientSearchInput>;

type SearchQueryFieldName = (typeof SEARCH_QUERY_FIELD_NAMES)[number];

/**
 * Maps a loaded `SearchQuery` into `ClientSearchInput`.
 * Returns `null` when there is no record or no mapped search criteria
 * (so callers can treat it as "nothing to run yet").
 */
export function searchQueryToClientSearchInput(
  data: SearchQueryFieldsFragment | null | undefined
): ClientSearchInput | null {
  if (!data) return null;
  const result: ClientSearchInput = {};
  for (const key of SEARCH_QUERY_FIELD_NAMES) {
    const v = data[key];
    // Omit empty/unset fields, to avoid a double-query with all the unset fields set explicitly to null.
    if (v) result[key] = v;
  }
  return result;
}

/**
 * Builds the `SearchQuery`-shaped object for Apollo `writeQuery`, with `null` for missing
 * keys so the normalized cache object matches the `SearchQueryFields` fragment selection.
 */
export function clientSearchInputToSearchQueryCacheFields(
  input: ClientSearchInput | null | undefined
): Pick<SearchQueryFieldsFragment, SearchQueryFieldName> {
  return {
    textSearch: input?.textSearch ?? null,
    personalId: input?.personalId ?? null,
    warehouseId: input?.warehouseId ?? null,
    firstName: input?.firstName ?? null,
    lastName: input?.lastName ?? null,
    ssnSerial: input?.ssnSerial ?? null,
    dob: input?.dob ?? null,
  } satisfies Pick<SearchQueryFieldsFragment, SearchQueryFieldName>;
}

export const keySearchParamsByLinkId = (
  values?: ClientSearchInput
): FormValues => {
  if (!values) return {};

  const mapped: FormValues = {};
  Object.keys(values).forEach((key) => {
    const item = SearchFormDefinition.item.find(
      (i) => i.mapping?.fieldName === key
    );
    if (item) {
      mapped[item.linkId] = values[key as keyof ClientSearchInput];
    }
  });
  return mapped;
};
