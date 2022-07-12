// Placeholder!
// We'll eventually fetch a search config from the backend, and have some frontend mapping for transformations

import { format } from 'date-fns';

import { OrganizationOption } from '@/components/elements/input/OrganizationSelect';
import { ProjectOption } from '@/components/elements/input/ProjectSelect';
const config = {
  fields: [
    {
      label: 'Personal ID',
      type: 'text',
      _uid: 'personalId', // name of the query variable
    },
    {
      label: 'First Name',
      type: 'text',
      _uid: 'firstName',
    },
    {
      label: 'Last Name',
      type: 'text',
      _uid: 'lastName',
    },
    {
      label: 'Last 4 Social',
      type: 'text',
      _uid: 'ssn',
    },
    {
      label: 'Date of Birth',
      type: 'date',
      _uid: 'dob',
      transform: (value: Date) => format(value, 'MM/dd/yyyy'),
    },
  ],
  additionalFields: [
    {
      label: 'Projects',
      type: 'projectMultiSelect',
      _uid: 'projects',
      transform: (value: ProjectOption[]) => value?.map((item) => item.value),
    },
    {
      label: 'Organizations',
      type: 'organizationMultiSelect',
      _uid: 'organizations',
      transform: (value: OrganizationOption[]) =>
        value?.map((item) => item.value),
    },
  ],
};

// transform form values to graphql variables (fixme: move)
export const transformValues = (values: Record<string, any>) => {
  const variables: Record<string, any> = {};
  Object.keys(values).forEach((k) => {
    const transform = [...config.fields, ...config.additionalFields].find(
      (e) => e._uid === k
    )?.transform;
    if (transform) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
      variables[k] = transform(values[k]);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument
      variables[k] = values[k];
    }
  });
  return variables;
};

export default config;
