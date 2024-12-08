import CheckIcon from '@mui/icons-material/Check';
import { Button, ButtonProps, Stack } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';

export default {
  component: Button,
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
    // disabled: true,
    startIcon: <CheckIcon />,
  },
  render: (props) => (
    <Stack gap={2}>
      {(
        [
          'grayscale',
          'primary',
          'error',
          'secondary', // not in figma, should not be used?
          'warning', // not in figma, should not be used?
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
