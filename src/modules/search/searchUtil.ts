import { omitBy, isNil } from 'lodash-es';

import { FormDefinitionJson } from '@/types/gqlTypes';

// Construct js object of permitted query terms from search params
export const searchParamsToVariables = (
  searchFormDefinition: FormDefinitionJson,
  searchParams: URLSearchParams
) => {
  const variables: Record<string, any> = {};
  const fieldNames: [string, boolean][] = searchFormDefinition.item
    .filter((i) => !!i.fieldName)
    .map((item) => [item.fieldName as string, !!item.repeats]);
  fieldNames.push(['textSearch', false]);
  fieldNames.push(['projects', true]);
  fieldNames.forEach(([fieldName, repeats]) => {
    if (!searchParams.has(fieldName)) return;
    if (repeats) {
      variables[fieldName] = searchParams.getAll(fieldName);
    } else {
      variables[fieldName] = searchParams.get(fieldName);
    }
  });

  return omitBy(variables, isNil);
};

// Construct from state from query variables
// This only works because Project and Organization are the only dropdowns.
// Need to revisit if search form options are expanded to use PickListOptions.
export const searchParamsToState = (
  searchFormDefinition: FormDefinitionJson,
  searchParams: URLSearchParams
) => {
  const variables: Record<string, any> = {};
  const fieldNames: [string, string, boolean][] = searchFormDefinition.item.map(
    (item) => [item.fieldName as string, item.linkId, !!item.repeats]
  );
  fieldNames.push(['textSearch', 'textSearch', false]);
  fieldNames.push(['projects', 'projects', true]);
  fieldNames.forEach(([fieldName, linkId, repeats]) => {
    if (!searchParams.has(fieldName)) return;
    if (repeats) {
      variables[linkId] = searchParams
        .getAll(fieldName)
        .map((code: string) => ({ code }));
    } else {
      variables[linkId] = searchParams.get(fieldName);
    }
  });

  return omitBy(variables, isNil);
};
