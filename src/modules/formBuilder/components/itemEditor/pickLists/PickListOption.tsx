import { Stack } from '@mui/material';
import { useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import ControlledCheckbox from '@/modules/form/components/rhf/ControlledCheckbox';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import { FormItemControl } from '@/modules/formBuilder/components/itemEditor/types';
import { Component } from '@/types/gqlTypes';

interface PickListOptionProps {
  control: FormItemControl;
  index: number;
  formItemComponent: Component;
  onChangeInitialSelected: (code: string) => void;
  isCodeUnique: (coe: string) => boolean;
  code?: string;
}

const PickListOption: React.FC<PickListOptionProps> = ({
  control,
  code,
  index,
  formItemComponent,
  isCodeUnique,
  onChangeInitialSelected,
}) => {
  // Listen for changes to the initialSelected value in order to set all the other
  // pick list options' `initialSelected` values to false when this one is set to true.
  const initialSelected = useWatch({
    control,
    name: `pickListOptions.${index}.initialSelected`,
  });
  useEffect(() => {
    if (initialSelected && code) {
      onChangeInitialSelected(code);
    }
  }, [onChangeInitialSelected, code, initialSelected]);

  return (
    <Stack gap={2}>
      <ControlledTextInput
        control={control}
        name={`pickListOptions.${index}.code`}
        label='Code'
        helperText='Must be unique'
        required={true}
        rules={{
          validate: (input) => isCodeUnique(input),
        }}
      />
      <ControlledTextInput
        control={control}
        name={`pickListOptions.${index}.label`}
        label='Label'
        helperText='If Label is not provided, Code will be displayed'
      />

      <ControlledCheckbox
        name={`pickListOptions.${index}.initialSelected`}
        control={control}
        label='Initially selected'
        helperText='Whether this choice is selected by default'
      />

      {formItemComponent !== Component.Dropdown && (
        // Helper text is only supported for radio/checkbox, not dropdown options
        <ControlledTextInput
          control={control}
          name={`pickListOptions.${index}.helperText`}
          label='Helper text'
          helperText='Helper text (may contain HTML)'
        />
      )}

      {formItemComponent === Component.Dropdown && (
        // Secondary label and group are only supported for dropdowns
        <>
          <ControlledTextInput
            control={control}
            name={`pickListOptions.${index}.secondaryLabel`}
            label='Secondary Label'
            helperText='Secondary label for dropdown items'
          />

          <Stack direction='row' gap={1}>
            <ControlledTextInput
              control={control}
              name={`pickListOptions.${index}.groupLabel`}
              label='Group Label'
              helperText='Label for group that this choice belongs to, if grouped'
            />
            <ControlledTextInput
              control={control}
              name={`pickListOptions.${index}.groupCode`}
              label='Group Code'
              helperText='Code for group that this choice belongs to, if grouped'
            />
          </Stack>
        </>
      )}

      <ControlledTextInput
        control={control}
        name={`pickListOptions.${index}.numericValue`}
        label='Numeric value'
        helperText='Numeric value, such as a score, used for comparison in conditional logic'
        type='number'
      />
    </Stack>
  );
};

export default PickListOption;
