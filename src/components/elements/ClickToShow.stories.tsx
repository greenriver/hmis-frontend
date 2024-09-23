import { Meta, StoryObj } from '@storybook/react';

import { userEvent, within, expect } from '@storybook/test';
import ClickToShow from './ClickToShow';

export default {
  title: 'ClickToShow',
  component: ClickToShow,
} as Meta<typeof ClickToShow>;

type Story = StoryObj<typeof ClickToShow>;

export const Default: Story = { args: { children: 'Hidden Value' } };

export const Clicked: Story = {
  args: {
    children: 'Hidden Value',
    hiddenAriaLabel: 'Hidden, click to reveal',
    shownAriaLabel: 'Shown, click to hide',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const btn = canvas.getByTestId('clickToShow');
    await expect(btn).toBeInTheDocument();
    // can't use .toHaveAccessibleDescription due to issue: https://github.com/eps1lon/dom-accessibility-api/issues/955
    await expect(btn).toHaveAttribute('aria-label', 'Hidden, click to reveal');

    await userEvent.click(btn);

    await expect(btn).toHaveTextContent('Hidden Value');
    await expect(btn).toHaveAttribute('aria-label', 'Shown, click to hide');
  },
};
