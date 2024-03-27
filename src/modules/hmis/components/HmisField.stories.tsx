import { Meta, StoryFn } from '@storybook/react';

import HmisField from './HmisField';
import { Gender, RelationshipToHoH } from '@/types/gqlTypes';

export default {
  title: 'HmisField',
  component: HmisField,
} as Meta<typeof HmisField>;

const Template: StoryFn<typeof HmisField> = (args) => <HmisField {...args} />;

export const EnumField = Template.bind({});
EnumField.args = {
  record: {
    __typename: 'Enrollment',
    id: '1',
    relationshipToHoH: RelationshipToHoH.SpouseOrPartner,
  },
  recordType: 'Enrollment',
  fieldName: 'relationshipToHoH',
};

export const EnumArrayField = Template.bind({});
EnumArrayField.args = {
  record: {
    __typename: 'Client',
    id: '1',
    gender: [Gender.Man, Gender.NonBinary],
  },
  recordType: 'Client',
  fieldName: 'gender',
};

export const DateField = Template.bind({});
DateField.args = {
  record: {
    __typename: 'Enrollment',
    id: '1',
    entryDate: '2020-01-01',
  },
  recordType: 'Enrollment',
  fieldName: 'entryDate',
};

export const BooleanField = Template.bind({});
BooleanField.args = {
  record: {
    __typename: 'Enrollment',
    id: '1',
    inProgress: false,
  },
  recordType: 'Enrollment',
  fieldName: 'inProgress',
};

export const CustomDataElementField = Template.bind({});
CustomDataElementField.args = {
  record: {
    __typename: 'Client',
    id: '1',
    customDataElements: [
      {
        key: 'color',
        label: 'favorite color',
        value: { valueString: 'green' },
      },
    ],
  },
  recordType: 'Client',
  customFieldKey: 'color',
};
