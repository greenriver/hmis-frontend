import { FormDefinition } from '../types';

import funder from '@/modules/form/data/funder.json';
import inventory from '@/modules/form/data/inventory.json';
import projectCoc from '@/modules/form/data/projectCoc.json';

export const FunderFormDefinition: FormDefinition = JSON.parse(
  JSON.stringify(funder)
);
//asdf
export const ProjectCocFormDefinition: FormDefinition = JSON.parse(
  JSON.stringify(projectCoc)
);
export const InventoryFormDefinition: FormDefinition = JSON.parse(
  JSON.stringify(inventory)
);
