import { Meta, StoryObj } from '@storybook/react';
import { format, formatISO, subDays, subHours } from 'date-fns';

import DateWithRelativeTooltip from './DateWithRelativeTooltip';

export default {
  component: DateWithRelativeTooltip,
} as Meta<typeof DateWithRelativeTooltip>;

type Story = StoryObj<typeof DateWithRelativeTooltip>;

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
