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

export const WithAllNameComponents = Template.bind({});
WithAllNameComponents.args = {
  client: {
    firstName: 'Rita',
    middleName: 'Jane',
    lastName: 'Ackroyd',
    nameSuffix: 'Jr',
  },
};

export const WithLink = Template.bind({});
WithLink.args = {
  client: {
    id: 5,
    firstName: 'Rita',
    lastName: 'Ackroyd',
  },
  linkToProfile: true,
};
