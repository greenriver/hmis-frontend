import CheckIcon from '@mui/icons-material/Check';
import { Button, ButtonProps, Stack } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';

export default {
  component: Button,
  // controls don't auto-populate because we are importing Button directly from MUI library
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
    startIcon: { control: false },
    disabled: { control: 'boolean' },
  },
} as Meta<typeof Button>;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Action',
  },
};

const ButtonMatrix: React.FC<ButtonProps> = (props) => {
  return (
    <>
      <Stack gap={2} direction='row'>
        {(
          [
            'grayscale',
            'primary',
            'error',
            'warning',
            // 'secondary',
            // 'info',
            // 'success',
            // Note: secondary, info, and success button colors exist in MUI but are not part of HMIS design language.
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
