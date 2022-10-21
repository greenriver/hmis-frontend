import client from '@/modules/form/data/client.json';
import funder from '@/modules/form/data/funder.json';
import inventory from '@/modules/form/data/inventory.json';
import organization from '@/modules/form/data/organization.json';
import project from '@/modules/form/data/project.json';
import projectCoc from '@/modules/form/data/projectCoc.json';
import search from '@/modules/form/data/search.json';
import { FormDefinitionJson } from '@/types/gqlTypes';

export const FunderFormDefinition: FormDefinitionJson = JSON.parse(
  JSON.stringify(funder)
);

export const ProjectCocFormDefinition: FormDefinitionJson = JSON.parse(
  JSON.stringify(projectCoc)
);
export const InventoryFormDefinition: FormDefinitionJson = JSON.parse(
  JSON.stringify(inventory)
);

export const ClientFormDefinition: FormDefinitionJson = JSON.parse(
  JSON.stringify(client)
);
export const OrganizationFormDefinition: FormDefinitionJson = JSON.parse(
  JSON.stringify(organization)
);

export const ProjectFormDefinition: FormDefinitionJson = JSON.parse(
  JSON.stringify(project)
);

export const SearchFormDefinition: FormDefinitionJson = JSON.parse(
  JSON.stringify(search)
);
