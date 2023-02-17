import { ComponentStory, ComponentMeta } from '@storybook/react';

import ClientProfileCard from './ClientProfileCard';

import { RITA_ACKROYD } from '@/test/__mocks__/requests';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export default {
  title: 'ClientProfileCard',
  component: ClientProfileCard,
} as ComponentMeta<typeof ClientProfileCard>;

const Template: ComponentStory<typeof ClientProfileCard> = (args) => (
  <ClientProfileCard {...args} />
);

export const Default = Template.bind({});
Default.args = {
  client: RITA_ACKROYD as ClientFieldsFragment,
};

export const WithPreferredName = Template.bind({});
WithPreferredName.args = {
  client: { ...RITA_ACKROYD, preferredName: 'RJ' } as ClientFieldsFragment,
};

export const WithFewerDetails = Template.bind({});
WithFewerDetails.args = {
  onlyCard: true,
  client: {
    ...RITA_ACKROYD,
    pronouns: [],
    ssn: null,
    dob: null,
  } as ClientFieldsFragment,
};
