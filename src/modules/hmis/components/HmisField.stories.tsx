import { Meta, StoryFn } from '@storybook/react';

import HmisField from './HmisField';
import { RITA_ACKROYD, fakeEnrollment } from '@/test/__mocks__/requests';

export default {
  title: 'HmisField',
  component: HmisField,
} as Meta<typeof HmisField>;

const Template: StoryFn<typeof HmisField> = (args) => <HmisField {...args} />;

const ENROLLMENT = fakeEnrollment();

export const EnumField = Template.bind({});
EnumField.args = {
  record: ENROLLMENT,
  recordType: 'Enrollment',
  fieldName: 'relationshipToHoH',
};

export const EnumArrayField = Template.bind({});
EnumArrayField.args = {
  record: RITA_ACKROYD,
  recordType: 'Client',
  fieldName: 'gender',
};

export const DateField = Template.bind({});
DateField.args = {
  record: ENROLLMENT,
  recordType: 'Enrollment',
  fieldName: 'entryDate',
};

export const BooleanField = Template.bind({});
BooleanField.args = {
  record: ENROLLMENT,
  recordType: 'Enrollment',
  fieldName: 'inProgress',
};

export const CustomDataElementField = Template.bind({});
CustomDataElementField.args = {
  record: {
    ...ENROLLMENT,
    customDataElements: [
      {
        key: 'color',
        label: 'favorite color',
        value: { valueString: 'green' },
      },
    ],
  },
  recordType: 'Enrollment',
  customFieldKey: 'color',
};
