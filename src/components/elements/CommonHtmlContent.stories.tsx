import { Meta, StoryObj } from '@storybook/react';

import CommonHtmlContent from './CommonHtmlContent';

export default {
  component: CommonHtmlContent,
} as Meta<typeof CommonHtmlContent>;

type Story = StoryObj<typeof CommonHtmlContent>;

export const Default: Story = {
  args: {
    children:
      '<p>Plain <strong>HTML</strong> content is sanitized and rendered safely.</p><ul><li>List item one</li><li>List item two</li></ul>',
  },
};

export const WithTypographyVariant: Story = {
  args: {
    children: '<span>Rendered with <b><code>variant="body2"</code></b>.</span>',
    variant: 'body2',
  },
};

export const AsSpan: Story = {
  args: {
    children: 'Inline content as a <b><code>span</code></b> (e.g. for labels).',
    component: 'span',
    variant: 'body2',
  },
};
