import { Stack } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';
import ButtonLink, { ButtonLinkProps } from './ButtonLink';

export default {
  component: ButtonLink,
} as Meta<typeof ButtonLink>;

type Story = StoryObj<typeof ButtonLink>;

const ButtonLinkMatrix: React.FC<ButtonLinkProps> = (props) => (
  <Stack gap={2} direction='row'>
    {(
      [
        'grayscale',
        'primary',
        'error',
        'warning',
        // Note: secondary, info, and success button colors exist in MUI but are not part of HMIS design language.
      ] as ButtonLinkProps['color'][]
    ).map((color, idx) => (
      <Stack gap={2} alignItems='center' key={color}>
        <Stack direction='row' gap={1}>
          {idx === 0 && <span style={{ width: '100px' }}></span>}
          <span style={{ width: '100px' }}>{color}</span>
        </Stack>
        {(
          ['contained', 'outlined', 'text'] as ButtonLinkProps['variant'][]
        ).map((variant) => (
          <Stack direction='row' gap={1} key={variant}>
            {idx === 0 && <span style={{ width: '100px' }}>{variant}</span>}
            <ButtonLink {...props} color={color} variant={variant} />
          </Stack>
        ))}
      </Stack>
    ))}
  </Stack>
);

export const Default: Story = {
  args: {
    to: '/',
    children: 'Link Text',
  },
};

export const AllVariants: Story = {
  args: {
    to: '/',
    children: 'Link Text',
  },
  render: (props) => <ButtonLinkMatrix {...props} />,
};

export const AllVariantsDisabled: Story = {
  args: {
    to: '/',
    children: 'Link Text',
  },
  render: (props) => <ButtonLinkMatrix disabled {...props} />,
};
