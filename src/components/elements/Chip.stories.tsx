import { Chip, ChipProps, Paper, Stack } from '@mui/material';
import { Meta, StoryObj } from '@storybook/react';
import { InProgressIcon } from './SemanticIcons';

export default {
  component: Chip,
  // controls don't auto-populate because we are importing Button directly from MUI library
  argTypes: {
    color: {
      options: [undefined, 'primary', 'warning', 'success', 'grayscale'],
      control: { type: 'select' },
    },
  },
} as Meta<typeof Chip>;

type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  args: {
    label: 'Chip text',
    variant: 'status',
    icon: <InProgressIcon />,
  },
};

const ChipMatrix: React.FC<ChipProps> = (props) => {
  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Stack gap={2} direction='row'>
          {(
            [
              undefined,
              'grayscale',
              'primary',
              'warning',
              'success',
              // Other chip colors exist in MUI but are not part of our design library
            ] as ChipProps['color'][]
          ).map((color, idx) => (
            <Stack gap={2} alignItems='center' key={color || 'default'}>
              <Stack direction='row' gap={1}>
                {idx === 0 && <span style={{ width: '100px' }}></span>}
                <span style={{ width: '100px' }}>{color || 'default'}</span>
              </Stack>
              {(['status'] as ChipProps['variant'][]).map((variant) => (
                <Stack direction='row' gap={1} key={variant}>
                  {idx === 0 && (
                    <span style={{ width: '100px' }}>{variant}</span>
                  )}
                  <Chip {...props} color={color} variant={variant} />
                </Stack>
              ))}
            </Stack>
          ))}
        </Stack>
      </Paper>
    </>
  );
};

export const AllVariants: Story = {
  args: {
    label: 'Chip text',
    icon: <InProgressIcon />,
  },
  render: (props) => <ChipMatrix {...props} />,
};
