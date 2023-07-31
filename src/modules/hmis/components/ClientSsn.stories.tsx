import { StoryFn, Meta } from '@storybook/react';

import ClientSsn from './ClientSsn';

import { ClientFieldsFragment } from '@/types/gqlTypes';

export default {
  title: 'ClientSsn',
  component: ClientSsn,
} as Meta<typeof ClientSsn>;

const Template: StoryFn<typeof ClientSsn> = (args) => <ClientSsn {...args} />;

export const Default = Template.bind({});
Default.args = {
  client: { ssn: '000112222' } as ClientFieldsFragment,
};
