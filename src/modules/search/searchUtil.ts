import { FormValues } from '../form/types';
import { SearchFormDefinition } from '@/modules/form/data';
import {
  ClientSearchInput,
  ClientSearchParamsFieldsFragment,
} from '@/types/gqlTypes';

/**
 * Field names from `ClientSearchParamsFields` that map to `ClientSearchInput`. Used:
 * - to map a loaded `ClientSearchParams` into form state
 * - to prime Apollo cache after `SearchClients`
 */
const SEARCH_INPUT_FIELD_NAMES = [
  'textSearch',
  'personalId',
  'firstName',
  'lastName',
  'ssnSerial',
  'dob',
] as const satisfies ReadonlyArray<keyof ClientSearchInput>;

type SearchInputFieldName = (typeof SEARCH_INPUT_FIELD_NAMES)[number];

/**
 * Maps a loaded `ClientSearchParams` into `ClientSearchInput`.
 * Returns `null` when there is no record, so callers can treat it as "nothing to run yet".
 * Returns {} when there are no mapped search criteria (unexpected).
 */
export function searchParamsToClientSearchInput(
  data: ClientSearchParamsFieldsFragment | null
): ClientSearchInput | null {
  if (!data) return null;
  const result: ClientSearchInput = {};
  for (const key of SEARCH_INPUT_FIELD_NAMES) {
    const v = data[key];
    // Omit empty/unset fields.
    // This prevents GenericTableWithData from re-running the query because
    // the constructed ClientSearchInput appears to have changed
    // compared to the original ClientSearchInput created from user input.
    if (v) result[key] = v;
  }
  return result;
}

/**
 * Builds the `ClientSearchParams`-shaped object for Apollo `writeQuery`, with `null` for missing
 * keys so the normalized cache object matches the `ClientSearchParamsFields` fragment selection.
 */
export function clientSearchInputToSearchParamsCacheFields(
  input: ClientSearchInput | null
): Pick<ClientSearchParamsFieldsFragment, SearchInputFieldName> {
  return {
    textSearch: input?.textSearch ?? null,
    personalId: input?.personalId ?? null,
    firstName: input?.firstName ?? null,
    lastName: input?.lastName ?? null,
    ssnSerial: input?.ssnSerial ?? null,
    dob: input?.dob ?? null,
  } satisfies Pick<ClientSearchParamsFieldsFragment, SearchInputFieldName>;
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
