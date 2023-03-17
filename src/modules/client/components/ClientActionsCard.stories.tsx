import { ComponentStory, ComponentMeta } from '@storybook/react';

import ClientActionsCard from './ClientActionsCard';

import { RITA_ACKROYD } from '@/test/__mocks__/requests';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export default {
  title: 'ClientActionsCard',
  component: ClientActionsCard,
} as ComponentMeta<typeof ClientActionsCard>;

const Template: ComponentStory<typeof ClientActionsCard> = (args) => (
  <ClientActionsCard {...args} />
);

export const Default = Template.bind({});
Default.args = {
  client: RITA_ACKROYD as ClientFieldsFragment,
};
