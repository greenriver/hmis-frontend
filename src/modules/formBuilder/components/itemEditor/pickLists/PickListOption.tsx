import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Box, Collapse, IconButton, Stack, Tooltip } from '@mui/material';
import React, { useState } from 'react';
import ControlledCheckbox from '@/modules/form/components/rhf/ControlledCheckbox';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import { FormItemControl } from '@/modules/formBuilder/components/itemEditor/types';
import { Component } from '@/types/gqlTypes';

interface PickListOptionProps {
  control: FormItemControl;
  index: number;
  formItemComponent: Component;
  isCodeUnique: (code: string) => boolean;
  isInitialSelectedUnique: (checked: boolean) => boolean;
}

const PickListOption: React.FC<PickListOptionProps> = ({
  control,
  index,
  formItemComponent,
  isCodeUnique,
  isInitialSelectedUnique,
}) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <>
      <Stack direction='row' sx={{ justifyContent: 'space-between' }}>
        <ControlledTextInput
          control={control}
          name={`pickListOptions.${index}.code`}
          label={`Choice ${index + 1}`}
          helperText='Must be unique'
          required={true}
          rules={{ validate: (input) => isCodeUnique(input) }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title='Advanced' arrow placement='top'>
            <IconButton
              onClick={() => setAdvancedOpen(!advancedOpen)}
              size='small'
            >
              {advancedOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Tooltip>
        </Box>
      </Stack>

      <Collapse in={advancedOpen} sx={{ mt: 2 }}>
        <Stack gap={2}>
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
            helperText='Whether this choice is selected by default. Only one choice may be initially selected.'
            rules={{ validate: (input) => isInitialSelectedUnique(input) }}
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
      </Collapse>
    </>
  );
};

export default PickListOption;
