import { Meta, StoryObj } from '@storybook/react';

import HmisField from './HmisField';
import { Gender, RelationshipToHoH } from '@/types/gqlTypes';

export default {
  component: HmisField,
} as Meta<typeof HmisField>;

type Story = StoryObj<typeof HmisField>;

export const EnumField: Story = {
  args: {
    record: {
      __typename: 'Enrollment',
      id: '1',
      relationshipToHoH: RelationshipToHoH.SpouseOrPartner,
    },
    recordType: 'Enrollment',
    fieldName: 'relationshipToHoH',
  },
};

export const EnumArrayField: Story = {
  args: {
    record: {
      __typename: 'Client',
      id: '1',
      gender: [Gender.Man, Gender.NonBinary],
    },
    recordType: 'Client',
    fieldName: 'gender',
  },
};

export const DateField: Story = {
  args: {
    record: {
      __typename: 'Enrollment',
      id: '1',
      entryDate: '2020-01-01',
    },
    recordType: 'Enrollment',
    fieldName: 'entryDate',
  },
};

export const BooleanField: Story = {
  args: {
    record: {
      __typename: 'Enrollment',
      id: '1',
      inProgress: false,
    },
    recordType: 'Enrollment',
    fieldName: 'inProgress',
  },
};

export const CustomDataElementField: Story = {
  args: {
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
  },
};
