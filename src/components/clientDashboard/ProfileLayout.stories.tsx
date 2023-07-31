import { Meta, ComponentStory } from '@storybook/react';

import ProfileLayout from './ProfileLayout';

import { RITA_ACKROYD } from '@/test/__mocks__/requests';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export default {
  title: 'ClientProfile',
  component: ProfileLayout,
} as Meta<typeof ProfileLayout>;

const Template: ComponentStory<typeof ProfileLayout> = (args) => (
  <ProfileLayout {...args} />
);

export const Default = Template.bind({});
Default.args = {
  client: RITA_ACKROYD as ClientFieldsFragment,
  notices: [
    {
      id: '1',
      title: 'This is a serious alert',
      content: 'So you need to go do a thing right now',
      severity: 'error',
    },
    {
      id: '2',
      content: 'Information notes',
      severity: 'info',
    },
  ],
};
