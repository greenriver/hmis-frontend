import { Button } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';

import CommonCard from './CommonCard';
import { CompletedIcon } from '@/components/elements/SemanticIcons';
import GenericTable from '@/components/elements/table/GenericTable';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import { fakeClient } from '@/test/__mocks__/requests';
import { ClientSearchResultFieldsFragment } from '@/types/gqlTypes';

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
        rows={
          [
            fakeClient(),
            fakeClient(),
            fakeClient(),
          ] as ClientSearchResultFieldsFragment[]
        }
        columns={[CLIENT_COLUMNS.name, CLIENT_COLUMNS.age]}
      />
    ),
  },
};

export const WithIcon: Story = {
  args: {
    title: 'Completed',
    Icon: CompletedIcon,
    children: cardContent,
  },
};
