import { ComponentStory, ComponentMeta } from '@storybook/react';

import ClientDobAge from './ClientDobAge';

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
  client: { dob: '1980-02-02' } as ClientFieldsFragment,
};
