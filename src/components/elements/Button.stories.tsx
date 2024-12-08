import CheckIcon from '@mui/icons-material/Check';
import { Button, ButtonProps, Stack } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';

export default {
  component: Button,
  // not sure why these won't auto-populate from MUI types
  argTypes: {
    color: {
      options: ['grayscale', 'primary', 'secondary', 'error', 'warning'],
      control: { type: 'select' },
    },
    variant: {
      control: { type: 'select' },
      options: ['text', 'outlined', 'contained'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
    disabled: { control: 'boolean' },
  },
} as Meta<typeof Button>;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Action',
  },
};

export const AllColors: Story = {
  args: {
    children: 'Action',
    startIcon: <CheckIcon />,
    // disabled: true,
  },
  render: (props) => (
    <Stack gap={2}>
      {(
        [
          'grayscale',
          'primary',
          'error',
          'secondary',
          'warning',
          'info', // not in figma, should not be used?
          'success', // not in figma, should not be used?
        ] as ButtonProps['color'][]
      ).map((color) => (
        <Stack direction='row' gap={2} alignItems='center' key={color}>
          <span style={{ width: '100px' }}>{color}</span>
          {(['contained', 'outlined', 'text'] as ButtonProps['variant'][]).map(
            (variant) => (
              <Button
                {...props}
                className='.MuiButton-active'
                color={color}
                variant={variant}
                key={variant}
              />
            )
          )}
        </Stack>
      ))}
    </Stack>
  ),
};
