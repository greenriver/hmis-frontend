import { Stack } from '@mui/material';
import { useCallback } from 'react';
import ControlledCheckbox from '@/modules/form/components/rhf/ControlledCheckbox';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import { FormItemControl } from '@/modules/formBuilder/components/itemEditor/types';
import { Component } from '@/types/gqlTypes';

interface PickListOptionProps {
  control: FormItemControl;
  index: number;
  formItemComponent: Component;
  setPickListInitialSelected: (code: string) => void;
  isCodeUnique: (coe: string) => boolean;
  code?: string;
}

const PickListOption: React.FC<PickListOptionProps> = ({
  control,
  code,
  index,
  formItemComponent,
  isCodeUnique,
  setPickListInitialSelected,
}) => {
  const onChangeInitialSelected = useCallback(
    (value: boolean) => {
      // Even though it's a controlled RHF checkbox, we still provide an onChange callback
      // in order to set all the other pick list options' `initialSelected` values to false when this one is set to true.
      if (value && code) setPickListInitialSelected(code);
    },
    [setPickListInitialSelected, code]
  );

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
        onChange={onChangeInitialSelected}
      />

      {formItemComponent !== Component.Dropdown && (
        // Helper text is only supported for radio/checkbox, not dropdown options
        <ControlledTextInput
          control={control}
          name={`pickListOptions.${index}.helperText`}
          label='Helper text'
          helperText='Helper text, including html'
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
        rules={{
          validate: (input) => !input || /^-?\d+$/.test(input),
        }}
      />
    </Stack>
  );
};

export default PickListOption;
