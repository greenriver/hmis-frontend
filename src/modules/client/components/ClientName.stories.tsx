import { ComponentMeta, ComponentStory } from '@storybook/react';

import ClientName from './ClientName';

export default {
  title: 'ClientName',
  component: ClientName,
} as ComponentMeta<typeof ClientName>;

const Template: ComponentStory<typeof ClientName> = (args) => (
  <ClientName {...args} />
);

export const Default = Template.bind({});
Default.args = {
  client: {
    firstName: 'Rita',
    middleName: 'Jane',
    lastName: 'Ackroyd',
  },
};

export const WithPreferredName = Template.bind({});
WithPreferredName.args = {
  client: {
    preferredName: 'RJ',
    firstName: 'Rita',
    middleName: 'Jane',
    lastName: 'Ackroyd',
  },
};

export const WithOnlyPreferredName = Template.bind({});
WithOnlyPreferredName.args = {
  client: { preferredName: 'RJ' },
};

export const WithAllNameComponents = Template.bind({});
WithAllNameComponents.args = {
  client: {
    firstName: 'Rita',
    middleName: 'Jane',
    lastName: 'Ackroyd',
    nameSuffix: 'Jr',
    preferredName: 'RJ',
  },
};

export const WithLink = Template.bind({});
WithLink.args = {
  client: {
    id: 5,
    firstName: 'Rita',
    lastName: 'Ackroyd',
    preferredName: null,
  },
  linkToProfile: true,
};

export const WithLinkAndPreferredName = Template.bind({});
WithLinkAndPreferredName.args = {
  client: {
    id: 5,
    firstName: 'Rita',
    lastName: 'Ackroyd',
    preferredName: 'RJ',
  },
  linkToProfile: true,
};
