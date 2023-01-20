import { ComponentStory, ComponentMeta } from '@storybook/react';

import ClientEnrollmentCard from './ClientEnrollmentCard';

import {
  RITA_ACKROYD,
  RITA_ACKROYD_WITHOUT_ENROLLMENTS,
} from '@/test/__mocks__/requests';
import { ClientFieldsFragment } from '@/types/gqlTypes';

export default {
  title: 'ClientEnrollmentCard',
  component: ClientEnrollmentCard,
} as ComponentMeta<typeof ClientEnrollmentCard>;

const Template: ComponentStory<typeof ClientEnrollmentCard> = (args) => (
  <ClientEnrollmentCard {...args} />
);

export const Default = Template.bind({});
Default.args = {
  client: RITA_ACKROYD as ClientFieldsFragment,
};

export const NoEnrollments = Template.bind({});
Default.args = {
  client: RITA_ACKROYD_WITHOUT_ENROLLMENTS as ClientFieldsFragment,
};
