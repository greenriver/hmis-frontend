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
      label: 'Projects',
      type: 'text',
      _uid: 'projects',
    },
  ],
  additionalFields: [
    {
      label: 'Last 4 Social',
      type: 'text',
      _uid: 'ssn',
    },
    {
      label: 'Organizations',
      type: 'text',
      _uid: 'organizations',
    },
    {
      label: 'Date of Birth',
      type: 'date',
      _uid: 'dob',
    },
  ],
};
