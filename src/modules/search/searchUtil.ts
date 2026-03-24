import { FormValues } from '../form/types';
import { SearchFormDefinition } from '@/modules/form/data';
import { ClientSearchInput, GetSearchQueryQuery } from '@/types/gqlTypes';

/**
 * Field names shared between the `GetSearchQuery` GraphQL selection and `ClientSearchInput`.
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

// String name of a field shared between SearchQueryType and ClientSearchInput
type SearchQueryFieldName = (typeof SEARCH_QUERY_FIELD_NAMES)[number];

// The `searchQuery` object shape returned by `GetSearchQuery` graphql query
type SearchQueryType = NonNullable<GetSearchQueryQuery['searchQuery']>;

/**
 * Maps a loaded `SearchQuery` into `ClientSearchInput`.
 */
export function searchQueryToClientSearchInput(
  data: SearchQueryType | null | undefined
): ClientSearchInput {
  if (!data) return {};
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
 * keys so the normalized cache object matches the `GetSearchQuery` selection set.
 */
export function clientSearchInputToSearchQueryCacheFields(
  input: ClientSearchInput | null | undefined
): Pick<SearchQueryType, SearchQueryFieldName> {
  return {
    textSearch: input?.textSearch ?? null,
    personalId: input?.personalId ?? null,
    warehouseId: input?.warehouseId ?? null,
    firstName: input?.firstName ?? null,
    lastName: input?.lastName ?? null,
    ssnSerial: input?.ssnSerial ?? null,
    dob: input?.dob ?? null,
  } satisfies Pick<SearchQueryType, SearchQueryFieldName>;
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
