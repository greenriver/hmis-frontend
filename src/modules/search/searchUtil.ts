import { isNil, omitBy } from 'lodash-es';
import { FormValues } from '../form/types';
import { SearchFormDefinition } from '@/modules/form/data';
import { ClientSearchInput, FormDefinitionJson } from '@/types/gqlTypes';

// Construct js object of permitted query terms from search params
export const searchParamsToVariables = (
  searchFormDefinition: FormDefinitionJson,
  searchParams: URLSearchParams
) => {
  const variables: Record<string, any> = {};
  const fieldNames: [string, boolean][] = searchFormDefinition.item
    .filter((i) => !!i.mapping?.fieldName)
    .map((item) => [item.mapping?.fieldName as string, !!item.repeats]);
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
export const searchParamsToState = (
  searchParams: URLSearchParams
): ClientSearchInput => {
  const variables: Record<string, any> = {};
  const fieldNames: string[] = SearchFormDefinition.item.map(
    (item) => item.mapping?.fieldName as string
  );

  [...fieldNames, 'textSearch'].forEach((fieldName) => {
    if (!searchParams.has(fieldName)) return;
    variables[fieldName] = searchParams.get(fieldName);
  });
  return omitBy(variables, isNil);
};

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
