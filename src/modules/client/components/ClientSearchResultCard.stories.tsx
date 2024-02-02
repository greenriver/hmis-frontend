import { ComponentStory, Meta } from '@storybook/react';

import ClientSearchResultCard from './ClientSearchResultCard';

import { RITA_ACKROYD } from '@/test/__mocks__/requests';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export default {
  title: 'ClientSearchResultCard',
  component: ClientSearchResultCard,
} as Meta<typeof ClientSearchResultCard>;

const Template: ComponentStory<typeof ClientSearchResultCard> = (args) => (
  <ClientSearchResultCard {...args} />
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
    ssn: null,
    dob: null,
  } as ClientFieldsFragment,
  hideImage: true,
};
