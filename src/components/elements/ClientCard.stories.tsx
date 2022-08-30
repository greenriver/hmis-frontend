import { ComponentStory, ComponentMeta } from '@storybook/react';

import ClientCard from './ClientCard';

import { RITA_ACKROYD } from '@/test/__mocks__/requests';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export default {
  title: 'ClientCard',
  component: ClientCard,
} as ComponentMeta<typeof ClientCard>;

const Template: ComponentStory<typeof ClientCard> = (args) => (
  <ClientCard {...args} />
);

export const Default = Template.bind({});
Default.args = {
  client: RITA_ACKROYD as ClientFieldsFragment,
};

export const WithLinkAndNotices = Template.bind({});
WithLinkAndNotices.args = {
  client: RITA_ACKROYD as ClientFieldsFragment,
  showNotices: true,
  showLinkToRecord: true,
};
