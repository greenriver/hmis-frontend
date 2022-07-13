// Placeholder!
// We'll eventually fetch a search config from the backend, and have some frontend mapping for transformations

import { format } from 'date-fns';

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
    },
    {
      label: 'Organizations',
      type: 'organizationMultiSelect',
      _uid: 'organizations',
    },
  ],
};

// transform form values to graphql variables (fixme: move)
export const transformValues = (values: Record<string, any>) => {
  const variables: Record<string, any> = {};
  Object.keys(values).forEach((k) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value = values[k];
    if (value instanceof Date) {
      variables[k] = format(value, 'MM/dd/yyyy');
    } else if (value instanceof Array) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      variables[k] = value.map((item) => item.value);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      variables[k] = value;
    }
  });
  return variables;
};

export default config;
