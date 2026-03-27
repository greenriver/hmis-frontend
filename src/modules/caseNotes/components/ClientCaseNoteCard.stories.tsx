import { Meta, StoryObj } from '@storybook/react';

import ClientCaseNoteCard from './ClientCaseNoteCard';
import { CustomDataElementType, RelationshipToHoH } from '@/types/gqlTypes';

export default {
  component: ClientCaseNoteCard,
} as Meta<typeof ClientCaseNoteCard>;

type Story = StoryObj<typeof ClientCaseNoteCard>;

export const Default: Story = {
  args: {
    caseNote: {
      id: '1',
      informationDate: '2022-01-01',
      enrollment: {
        projectName: 'Project A',
        id: '',
        lockVersion: 0,
        entryDate: '2025-01-01',
        autoExited: false,
        inProgress: false,
        relationshipToHoH: RelationshipToHoH.SelfHeadOfHousehold,
        access: {
          __typename: undefined,
          id: '',
          canViewEnrollmentDetails: false,
        },
      },
      content: 'This is a sample case note content.',
      dateCreated: '2022-01-01T12:00:00Z',
      createdBy: {
        __typename: 'ApplicationUser',
        id: 'user1',
        name: 'John Doe',
        email: '',
        impersonating: false,
      },
      dateUpdated: '2022-01-02T12:00:00Z',
      user: {
        __typename: 'ApplicationUser',
        id: 'user2',
        name: 'Jane Smith',
        email: '',
        impersonating: false,
      },
      customDataElements: [
        {
          id: 'cde1',
          label: 'Custom Data Element 1',
          value: {
            id: '1',
            valueDate: '2022-01-01',
          },
          key: '',
          fieldType: CustomDataElementType.Date,
          repeats: false,
          displayHooks: [],
        },
        {
          id: 'cde2',
          label: 'Custom Data Element 2',
          value: {
            id: '2',
            valueString: 'Custom field string value',
          },
          key: '',
          fieldType: CustomDataElementType.String,
          repeats: false,
          displayHooks: [],
        },
      ],
    },
  },
};
