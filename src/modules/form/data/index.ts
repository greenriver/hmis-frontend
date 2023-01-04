import beds from '@/modules/form/data/beds.json';
import search from '@/modules/form/data/search.json';
import units from '@/modules/form/data/units.json';
import { FormDefinitionJson } from '@/types/gqlTypes';

export const SearchFormDefinition: FormDefinitionJson = JSON.parse(
  JSON.stringify(search)
);

export const BedsDefinition: FormDefinitionJson = JSON.parse(
  JSON.stringify(beds)
);

export const UnitsDefinition: FormDefinitionJson = JSON.parse(
  JSON.stringify(units)
);
