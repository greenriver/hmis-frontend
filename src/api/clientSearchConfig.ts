// Placeholder. We'll eventually fetch a search config from the backend.
export default {
  fields: [
    {
      label: 'Personal ID',
      type: 'text',
      _uid: 'personalId',
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
  ],
  additionalFields: [
    {
      label: 'Projects',
      type: 'projectMultiSelect',
      _uid: 'projects',
    },
    {
      label: 'Organizations',
      type: 'organizationMultiSelect',
      _uid: 'organizations',
    },
  ],
};
