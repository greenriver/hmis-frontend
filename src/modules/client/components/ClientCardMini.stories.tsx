import { ComponentStory, ComponentMeta } from '@storybook/react';

import ClientCardMini from './ClientCardMini';

import { RITA_ACKROYD } from '@/test/__mocks__/requests';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export default {
  title: 'ClientCardMini',
  component: ClientCardMini,
} as ComponentMeta<typeof ClientCardMini>;

const Template: ComponentStory<typeof ClientCardMini> = (args) => (
  <ClientCardMini {...args} />
);

export const Default = Template.bind({});
Default.args = {
  client: RITA_ACKROYD as ClientFieldsFragment,
};

export const WithoutImage = Template.bind({});
WithoutImage.args = {
  client: RITA_ACKROYD as ClientFieldsFragment,
  hideImage: true,
};

export const WithFewerDetails = Template.bind({});
WithFewerDetails.args = {
  client: {
    ...RITA_ACKROYD,
    pronouns: [],
    dob: null,
  } as ClientFieldsFragment,
  hideImage: true,
};
