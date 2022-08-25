import { omitBy, isNil } from 'lodash-es';

import { FormDefinition } from '../form/types';

// Construct js object of permitted query terms from search params
export const searchParamsToVariables = (
  searchFormDefinition: FormDefinition,
  searchParams: URLSearchParams
) => {
  const variables: Record<string, any> = {};
  searchFormDefinition.item.forEach((item) => {
    const fieldName = item?.mapping?.clientSearchInput;
    if (!fieldName) return;
    if (item.repeats) {
      variables[fieldName] = searchParams.getAll(fieldName);
    } else {
      variables[fieldName] = searchParams.get(fieldName);
    }
  });

  variables.textSearch = searchParams.get('textSearch');
  variables.projects = searchParams.getAll('projects');
  return omitBy(variables, isNil);
};

// Construct from state from query variables
// This only works because Project and Organization are the only dropdowns.
// Need to revisit if search form options are expanded to use answerOptions.
export const variablesToState = (
  searchFormDefinition: FormDefinition,
  searchParams: URLSearchParams
) => {
  const variables: Record<string, any> = {};
  searchFormDefinition.item.forEach((item) => {
    const fieldName = item?.mapping?.clientSearchInput;
    if (!fieldName) return;
    if (item.repeats) {
      const arr = searchParams.getAll(fieldName).map((id: string) => ({ id }));
      if (arr.length > 0) variables[item.linkId] = arr;
    } else {
      variables[item.linkId] = searchParams.get(fieldName);
    }
  });

  variables.textSearch = searchParams.get('textSearch');
  variables.projects = searchParams
    .getAll('projects')
    .map((id: string) => ({ id }));

  return omitBy(variables, isNil);
};
