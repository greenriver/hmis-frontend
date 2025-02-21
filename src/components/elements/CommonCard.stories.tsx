import { Button } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';

import CommonCard from './CommonCard';
import GenericTable from '@/components/elements/table/GenericTable';
import { DummyTableRows } from '@/components/elements/table/GenericTable.stories';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';

export default {
  component: CommonCard,
  argTypes: {
    padContent: { control: 'boolean' },
    headerVariant: {
      control: { type: 'select' },
      options: ['border', undefined],
    },
    children: { control: false },
    actions: { control: false },
  },
} as Meta<typeof CommonCard>;

type Story = StoryObj<typeof CommonCard>;

const cardContent = (
  <>
    This is card content <br />
    This is card content <br />
    This is card content <br />
    This is card content <br />
    This is card content
  </>
);

export const Default: Story = {
  args: {
    children: cardContent,
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Card with Title',
    children: cardContent,
  },
};

export const WithTitleBorder: Story = {
  args: {
    title: 'Card with Title and Border',
    headerVariant: 'border',
    children: cardContent,
  },
};

export const WithAction: Story = {
  args: {
    title: 'Card with Action Button',
    children: cardContent,
    actions: <Button>Click Me</Button>,
  },
};

export const WithNoPadding: Story = {
  args: {
    title: 'Card with Table Content (No Padding)',
    padContent: false,
    children: (
      <GenericTable
        rows={DummyTableRows}
        columns={[CLIENT_COLUMNS.name, CLIENT_COLUMNS.age]}
      />
    ),
  },
};
