import React from 'react';
import { Control, Controller } from 'react-hook-form';
import RadioGroupInput from '@/components/elements/input/RadioGroupInput';
import { PickListOption } from '@/types/gqlTypes';

interface Props {
  control?: Control; // Optional when using FormProvider
  name: string;
  required: boolean;
  options: PickListOption[];
  label: string;
}

const ControlledRadioGroupInput: React.FC<Props> = ({
  control,
  name,
  required,
  options,
  label,
}) => {
  return (
    <Controller
      name={name}
      control={control}
      shouldUnregister
      rules={required ? { required: true } : {}}
      render={({
        field: { ref, value, onChange, ...field },
        fieldState: { error },
      }) => (
        <RadioGroupInput
          options={options}
          label={label}
          value={options.find((o) => o.code === value)}
          onChange={(option) => onChange(option?.code)}
          error={!!error}
          helperText={error?.type === 'required' ? 'Required' : undefined}
          {...field}
        />
      )}
    />
  );
};

export default ControlledRadioGroupInput;
