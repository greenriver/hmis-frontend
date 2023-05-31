import { ComponentStory, ComponentMeta } from '@storybook/react';

import ClientDobAge from './ClientDobAge';

import { RITA_ACKROYD } from '@/test/__mocks__/requests';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export default {
  title: 'ClientDobAge',
  component: ClientDobAge,
} as ComponentMeta<typeof ClientDobAge>;

const Template: ComponentStory<typeof ClientDobAge> = (args) => (
  <ClientDobAge {...args} />
);

export const Default = Template.bind({});
Default.args = {
  client: RITA_ACKROYD as ClientFieldsFragment,
};
