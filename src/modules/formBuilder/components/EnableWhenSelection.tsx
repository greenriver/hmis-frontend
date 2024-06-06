import { Box, Grid, Stack, Typography } from '@mui/material';
import { startCase } from 'lodash-es';
import { useMemo, useState } from 'react';
import { Controller, useFieldArray, useWatch } from 'react-hook-form';
import { generateItemPickList } from '../formBuilderUtil';
import CardGroup, { RemovableCard } from './CardGroup';
import { FormItemControl } from './itemEditor/types';
import SelectOption from './SelectOption';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import NumberInput from '@/components/elements/input/NumberInput';
import RadioGroupInput from '@/components/elements/input/RadioGroupInput';
import TextInput from '@/components/elements/input/TextInput';
import YesNoRadio from '@/components/elements/input/YesNoRadio';
import { ItemMap } from '@/modules/form/types';
import { HmisEnums } from '@/types/gqlEnums';
import {
  EnableOperator,
  FormItem,
  ItemType,
  PickListOption,
} from '@/types/gqlTypes';

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
const EnableWhenCondition: React.FC<EnableWhenConditionProps> = ({
  control,
  index,
  itemPickList,
  itemMap,
  enableWhenPath = 'enableWhen',
}) => {
  // Watch state of this condition
  const state = useWatch({
    control,
    name: `${enableWhenPath}.${index}`,
  });
  // console.log(state);

  const dependentItem = useMemo(
    () => (state?.question ? itemMap[state?.question] : undefined),
    [itemMap, state?.question]
  );

  // determine which type(s) are valid for the answer field
  const answerInputTypes = useMemo(() => {
    // We dont know the operator yet, so don't know which answer type to use
    if (!state?.operator) return [];

    // We dont know the comparison type yet, so don't know which answer type to use
    if (!dependentItem && !state?.localConstant) return [];

    // Exists/Enabled are always boolean
    if (state?.operator === EnableOperator.Exists) return ['answerBoolean'];
    if (state?.operator === EnableOperator.Enabled) return ['answerBoolean'];

    // String input uses answerCode
    if (state?.localConstant) return ['answerCode'];

    if (!dependentItem) return [];

    if (dependentItem.type === ItemType.Choice) {
      // value in [x,y,z]
      if (state?.operator === EnableOperator.In) return ['answerCodes'];
      // value can be matched by code or group code
      return ['answerCode', 'answerGroupCode'];
    }

    if (dependentItem.type === ItemType.Boolean) return ['answerBoolean'];
    if (dependentItem.type === ItemType.Integer) return ['answerNumber'];
    if (dependentItem.type === ItemType.Currency) return ['answerNumber'];
    // not handled: compareQuestion
    return ['answerCode'];
  }, [dependentItem, state]);

  const answerHelperText =
    'Value to compare using the operator. If the expression evaluates to true, the condition is met.';
  const answerValueLabel = 'Response Value';

  // Advanced behaviors that are toggled off by default, or on if either are set
  const [advanced, setAdvanced] = useState({
    localConstant: !!state?.localConstant,
    groupCode: !!state?.answerGroupCode,
  });
  return (
    // max width needed to fix click target issue (clicking to the left to close the dropdown)
    // sx={{ maxWidth: MAX_INPUT_AND_LABEL_WIDTH }}
    <Stack>
      <Grid container gap={2}>
        {/* COLUMN 1: Select the dependent source */}
        <Grid item xs={4}>
          <Controller
            name={`${enableWhenPath}.${index}.question`}
            control={control}
            disabled={advanced.localConstant}
            render={({
              field: { ref, disabled, ...field },
              fieldState: { error },
            }) => (
              <SelectOption
                label='Dependent Question'
                options={itemPickList}
                sx={disabled ? { display: 'none' } : undefined}
                {...field}
                textInputProps={{
                  helperText:
                    error?.message ||
                    "Question who's response will determine whether the condition is met",
                  error: !!error,
                  inputRef: ref,
                }}
              />
            )}
          />
          <Controller
            name={`${enableWhenPath}.${index}.localConstant`}
            control={control}
            disabled={!advanced.localConstant}
            render={({
              field: { ref, disabled, ...field },
              fieldState: { error },
            }) => (
              <TextInput
                // FIXME should be a dropdown of available Local Constants for this Role
                label='Local Constant'
                helperText={
                  error?.message ||
                  "Local constant who's value will determine whether the condition is met"
                }
                sx={disabled ? { display: 'none' } : undefined}
                error={!!error}
                inputRef={ref}
                {...field}
              />
            )}
          />
        </Grid>
        {/* COLUMN 2: Select the comparison operator */}
        {/* TOOD: the operator picklist should be conditional based on the type of the dependent item. For example, "Less Than" is only applicable to numbers */}
        <Grid item xs={3}>
          <Controller
            name={`${enableWhenPath}.${index}.operator`}
            control={control}
            render={({ field: { ref, ...field }, fieldState: { error } }) => (
              <SelectOption
                label='Operator'
                options={enableOperatorPickList}
                {...field}
                textInputProps={{
                  helperText: error?.message,
                  error: !!error,
                  inputRef: ref,
                }}
              />
            )}
          />
        </Grid>
        {/* COLUMN 3: Select the comparison value */}
        <Grid item xs={4}>
          <Controller
            name={`${enableWhenPath}.${index}.answerBoolean`}
            control={control}
            disabled={!answerInputTypes.includes('answerBoolean')}
            render={({ field: { ref, disabled, ...field } }) => (
              <YesNoRadio
                sx={disabled ? { display: 'none' } : { mt: 3, ml: 2 }}
                {...field}
              />
            )}
          />
          <Controller
            name={`${enableWhenPath}.${index}.answerCode`}
            control={control}
            disabled={
              !answerInputTypes.includes('answerCode') || advanced.groupCode
            }
            render={({ field: { ref, disabled, ...field } }) => (
              <TextInput
                sx={
                  disabled && answerInputTypes.length > 0
                    ? { display: 'none' }
                    : undefined
                }
                label={answerValueLabel}
                helperText={answerHelperText}
                inputRef={ref}
                disabled={disabled}
                {...field}
              />
            )}
          />
          <Controller
            name={`${enableWhenPath}.${index}.answerCodes`}
            control={control}
            disabled={!answerInputTypes.includes('answerCodes')}
            render={({ field: { ref, disabled, ...field } }) => (
              <TextInput
                sx={disabled ? { display: 'none' } : undefined}
                label={answerValueLabel}
                helperText={answerHelperText}
                inputRef={ref}
                {...field}
              />
            )}
          />
          <Controller
            name={`${enableWhenPath}.${index}.answerNumber`}
            control={control}
            disabled={!answerInputTypes.includes('answerNumber')}
            render={({ field: { ref, disabled, ...field } }) => (
              <NumberInput
                sx={disabled ? { display: 'none' } : undefined}
                label={answerValueLabel}
                helperText={answerHelperText}
                inputRef={ref}
                {...field}
              />
            )}
          />
          <Controller
            name={`${enableWhenPath}.${index}.answerGroupCode`}
            control={control}
            disabled={!advanced.groupCode}
            render={({ field: { ref, disabled, ...field } }) => (
              <TextInput
                sx={disabled ? { display: 'none' } : undefined}
                label='Response Group'
                helperText='If dependent item uses a grouped picklist, enter the name of a group to compare using the operator.'
                inputRef={ref}
                {...field}
              />
            )}
          />
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
          {answerInputTypes.includes('answerGroupCode') && (
            <LabeledCheckbox
              label='Use Group Code for response value comparison'
              checked={advanced.groupCode}
              onChange={(evt, checked) =>
                setAdvanced((old) => ({ ...old, groupCode: checked }))
              }
            />
          )}
        </Stack>
      </Box>
    </Stack>
  );
};

export interface EnableWhenSelectionProps {
  control: FormItemControl;
  itemMap: ItemMap;
  initialItem?: FormItem; // remove
  enableWhenPath?: 'enableWhen' | `autofillValues.${number}.autofillWhen`; // path to enableWhen in form
  enableBehaviorPath?:
    | 'enableBehavior'
    | `autofillValues.${number}.autofillBehavior`;
}

const EnableWhenSelection: React.FC<EnableWhenSelectionProps> = ({
  control,
  itemMap,
  enableWhenPath = 'enableWhen',
  enableBehaviorPath = 'enableBehavior',
}) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: enableWhenPath,
  });

  const itemPickList = useMemo(() => generateItemPickList(itemMap), [itemMap]);

  const enableBehaviorOptions = useMemo(() => {
    const action = enableWhenPath.includes('autofillWhen')
      ? 'Autofill this value'
      : 'Display this item';
    return [
      {
        code: 'ALL',
        label: `${action} if all of the below conditions are met (AND logic)`,
      },
      {
        code: 'ANY',
        label: `${action} if any of the below conditions are met (OR logic)`,
      },
    ];
  }, [enableWhenPath]);
  return (
    <CardGroup
      onAddItem={() => {
        append({}, { shouldFocus: false });
      }}
      addItemText='Add Condition'
    >
      <Controller
        name={enableBehaviorPath}
        control={control}
        render={({ field: { ref, value, onChange, ...field } }) => (
          <RadioGroupInput
            options={enableBehaviorOptions}
            label='Conditional Behavior (AND/OR)'
            value={enableBehaviorOptions.find((o) => o.code === value)}
            onChange={(option) => onChange(option?.code)}
            {...field}
          />
        )}
      />

      {fields.map((condition, index) => (
        <RemovableCard
          key={JSON.stringify(condition)} // fixme could be non unique
          onRemove={() => remove(index)}
          removeTooltip={'Remove Condition'}
        >
          <EnableWhenCondition
            control={control}
            index={index}
            enableWhenPath={enableWhenPath}
            itemPickList={itemPickList}
            itemMap={itemMap}
          />
        </RemovableCard>
      ))}
    </CardGroup>
  );
};

export default EnableWhenSelection;
