import search from '@/modules/form/data/search.json';
import { FormDefinitionJson } from '@/types/gqlTypes';

export const SearchFormDefinition: FormDefinitionJson = JSON.parse(
  JSON.stringify(search)
);
