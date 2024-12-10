import { useArgs } from '@storybook/preview-api';
import { Meta, StoryObj } from '@storybook/react';

import GeolocationInput from './GeolocationInput';
import { getLabel } from '@/modules/form/components/DynamicField';
import { ItemType } from '@/types/gqlTypes';

export default {
  component: GeolocationInput,
  render: (args: any) => {
    const [{ value }, updateArgs] = useArgs();
    const onChange = (value: any) => updateArgs({ value });
    return <GeolocationInput {...args} onChange={onChange} value={value} />;
  },
} as Meta<typeof GeolocationInput>;

type Story = StoryObj<typeof GeolocationInput>;

export const Default: Story = {
  args: {},
};

export const Labeled: Story = {
  args: {
    // use the label that would be used by DynamicField
    label: getLabel({
      type: ItemType.Geolocation,
      text: 'Current Location',
      linkId: 'geolocation',
    }),
    // disabled: true,
    helperText: 'Helper text here',
  },
};
