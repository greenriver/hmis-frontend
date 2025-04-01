import { Meta, StoryObj } from '@storybook/react';
import { format, formatISO, subDays, subHours } from 'date-fns';

import RelativeDateDisplay from './RelativeDateDisplay';

export default {
  component: RelativeDateDisplay,
} as Meta<typeof RelativeDateDisplay>;

type Story = StoryObj<typeof RelativeDateDisplay>;

export const WithDate: Story = {
  args: {
    dateString: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
  },
};

export const WithDateTime: Story = {
  args: {
    dateString: formatISO(subHours(new Date(), 2)),
  },
};
