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

export const WithPreferredName = Template.bind({});
WithPreferredName.args = {
  client: { ...RITA_ACKROYD, preferredName: 'RJ' } as ClientFieldsFragment,
  hideImage: true,
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
    ssn: null,
    dob: null,
  } as ClientFieldsFragment,
  hideImage: true,
};

export const WithNotices = Template.bind({});
WithNotices.args = {
  client: RITA_ACKROYD as ClientFieldsFragment,
  showNotices: true,
};
