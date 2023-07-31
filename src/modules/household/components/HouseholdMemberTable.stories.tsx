import { ComponentStory, Meta } from '@storybook/react';

import HouseholdMemberTable from './HouseholdMemberTable';

import { RITA_ACKROYD } from '@/test/__mocks__/requests';

export default {
  title: 'HouseholdMemberTable',
  component: HouseholdMemberTable,
} as Meta<typeof HouseholdMemberTable>;

const Template: ComponentStory<typeof HouseholdMemberTable> = (args) => (
  <HouseholdMemberTable {...args} />
);

export const Default = Template.bind({});
Default.args = {
  clientId: RITA_ACKROYD.id,
  enrollmentId: '5',
};
