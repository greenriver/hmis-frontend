import { Box, Grid, Stack, Typography } from '@mui/material';
import { startCase } from 'lodash-es';
import { useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { FormItemControl } from '../types';
import { useLocalConstantsPickList } from '../useLocalConstantsPickList';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import YesNoRadio from '@/components/elements/input/YesNoRadio';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import { ItemMap } from '@/modules/form/types';
import { HmisEnums } from '@/types/gqlEnums';
import { PickListOption } from '@/types/gqlTypes';

const enableOperatorPickList = Object.keys(HmisEnums.EnableOperator).map(
  (code) => ({
    code,
    label: startCase(code.toLowerCase()),
  })
);

interface EnableWhenConditionProps {
  control: FormItemControl;
  index: number;
  itemPickList: PickListOption[];
  itemMap: ItemMap;
  enableWhenPath?: 'enableWhen' | `autofillValues.${number}.autofillWhen`; // path to enableWhen in form
}

// Component for managing a single EnableWhen condition
const EnableWhenCondition: React.FC<EnableWhenConditionProps> = ({
  control,
  index,
  itemPickList,
  enableWhenPath = 'enableWhen',
}) => {
  // Watch state of this condition
  const state = useWatch({
    control,
    name: `${enableWhenPath}.${index}`,
  });

  // const dependentItem = useMemo(
  //   () => (state?.question ? itemMap[state?.question] : undefined),
  //   [itemMap, state?.question]
  // );

  // Commented out until we have a better way of doing this and a design pass
  // // determine which type(s) are valid for the answer field
  // const answerInputTypes = useMemo(() => {
  //   // We dont know the operator yet, so don't know which answer type to use
  //   if (!state?.operator) return [];

  //   // We dont know the comparison type yet, so don't know which answer type to use
  //   if (!dependentItem && !state?.localConstant) return [];

  //   // Exists/Enabled are always boolean
  //   if (state?.operator === EnableOperator.Exists) return ['answerBoolean'];
  //   if (state?.operator === EnableOperator.Enabled) return ['answerBoolean'];

  //   // String input uses answerCode
  //   if (state?.localConstant) return ['answerCode'];

  //   if (!dependentItem) return [];

  //   if (dependentItem.type === ItemType.Choice) {
  //     // value in [x,y,z]
  //     if (state?.operator === EnableOperator.In) return ['answerCodes'];
  //     // value can be matched by code or group code
  //     return ['answerCode', 'answerGroupCode'];
  //   }

  //   if (dependentItem.type === ItemType.Boolean) return ['answerBoolean'];
  //   if (dependentItem.type === ItemType.Integer) return ['answerNumber'];
  //   if (dependentItem.type === ItemType.Currency) return ['answerNumber'];
  //   // not handled: compareQuestion
  //   return ['answerCode'];
  // }, [dependentItem, state]);

  const answerHelperText =
    'Value to compare using the operator. If the expression evaluates to true, the condition is met.';

  // Advanced behaviors that are toggled off by default, or on if either are set
  const [advanced, setAdvanced] = useState({
    localConstant: !!state?.localConstant,
    groupCode: !!state?.answerGroupCode,
  });

  const localConstantsPickList = useLocalConstantsPickList();

  return (
    <Stack>
      <Grid container gap={2}>
        {/* COLUMN 1: Select the dependent source */}
        <Grid item xs={4}>
          <Stack gap={1}>
            {!advanced.localConstant && (
              <ControlledSelect
                name={`${enableWhenPath}.${index}.question`}
                control={control}
                label='Dependent Question'
                placeholder='Select question'
                options={itemPickList}
                helperText='Question whose response will determine whether the condition is met'
                required
              />
            )}
            {advanced.localConstant && (
              <ControlledSelect
                name={`${enableWhenPath}.${index}.localConstant`}
                control={control}
                label='Local Constant'
                placeholder='Select local constant'
                rules={{
                  required: 'Local Constant or Dependent Question is required',
                }}
                options={localConstantsPickList}
                helperText="Local constant who's value will determine whether the condition is met"
              />
            )}
          </Stack>
        </Grid>
        {/* COLUMN 2: Select the comparison operator */}
        {/* TOOD: the operator picklist should be conditional based on the type of the dependent item. For example, "Less Than" is only applicable to numbers */}
        <Grid item xs={3}>
          <ControlledSelect
            name={`${enableWhenPath}.${index}.operator`}
            control={control}
            label='Operator'
            placeholder='Select operator'
            options={enableOperatorPickList}
            required
          />
        </Grid>
        {/* COLUMN 3: Select the comparison value */}
        {/* FIXME this should validate, and only allow the correct input type for the operator+dependent item type. The backend should probably validate the "oneOf" logic (too?). */}
        <Grid item xs={4}>
          <Stack gap={1}>
            <Controller
              name={`${enableWhenPath}.${index}.answerBoolean`}
              control={control}
              render={({ field: { ref, ...field }, fieldState: { error } }) => (
                <YesNoRadio
                  label='Response Value (Boolean)'
                  error={!!error}
                  helperText={error?.message}
                  {...field}
                />
              )}
            />
            <ControlledTextInput
              name={`${enableWhenPath}.${index}.answerCode`}
              control={control}
              label='Response Value (Code)'
              helperText={answerHelperText}
            />
            <ControlledTextInput
              name={`${enableWhenPath}.${index}.answerCodes`}
              control={control}
              label='Response Value (Code List)'
              helperText={answerHelperText}
            />
            <ControlledTextInput
              name={`${enableWhenPath}.${index}.answerNumber`}
              control={control}
              label='Response Value (Numeric)'
              type='number' // ok? we use another approach in NumberInput
            />
            <ControlledTextInput
              name={`${enableWhenPath}.${index}.answerGroupCode`}
              control={control}
              label='Response Group'
              helperText='If dependent item uses a grouped picklist, enter the name of a group to compare using the operator.'
            />
          </Stack>
        </Grid>
      </Grid>
      <Box
        sx={{
          mt: 2,
          '.MuiFormControlLabel-label': {
            fontSize: (theme) => theme.typography.body2.fontSize,
          },
          '.MuiCheckbox-root': { py: 0.5 },
        }}
      >
        <Typography sx={{ mb: 1 }}>Advanced Options</Typography>
        <Stack>
          <LabeledCheckbox
            label='Compare with a Local Constant instead of dependent Question'
            checked={advanced.localConstant}
            sx={{ typography: { variant: 'body2' } }}
            onChange={(evt, checked) =>
              setAdvanced((old) => ({ ...old, localConstant: checked }))
            }
          />
        </Stack>
      </Box>
    </Stack>
  );
};
export default EnableWhenCondition;
