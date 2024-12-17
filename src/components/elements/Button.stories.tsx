import CheckIcon from '@mui/icons-material/Check';
import { Button, ButtonProps, IconButton, Stack } from '@mui/material';
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

// todo: re-export this button from MUI so we restrict the colors that can be used
export const IconOnly: StoryObj<typeof IconButton> = {
  args: {
    children: <CheckIcon />,
  },
  render: (props) => <IconButton {...props} />,
};

const ButtonMatrix: React.FC<ButtonProps> = (props) => {
  return (
    <>
      <Stack gap={2} direction='row'>
        {(
          [
            'grayscale',
            'primary',
            // 'secondary', // todo remove
            'error',
            'warning',
            // 'info', // not in figma, should not be used?
            // 'success', // not in figma, should not be used?
          ] as ButtonProps['color'][]
        ).map((color, idx) => (
          <Stack gap={2} alignItems='center' key={color}>
            <Stack direction='row' gap={1}>
              {idx === 0 && <span style={{ width: '100px' }}></span>}
              <span style={{ width: '100px' }}>{color}</span>
            </Stack>
            {(
              ['contained', 'outlined', 'text'] as ButtonProps['variant'][]
            ).map((variant) => (
              <Stack direction='row' gap={1}>
                {idx === 0 && <span style={{ width: '100px' }}>{variant}</span>}
                <Button
                  {...props}
                  color={color}
                  variant={variant}
                  key={variant}
                />
              </Stack>
            ))}
          </Stack>
        ))}
      </Stack>
    </>
  );
};

export const AllVariants: Story = {
  args: {
    children: 'Action',
    startIcon: <CheckIcon />,
  },
  render: (props) => <ButtonMatrix {...props} />,
};
