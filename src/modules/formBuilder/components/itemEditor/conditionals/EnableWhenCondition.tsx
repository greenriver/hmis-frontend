import { Box, Grid, Stack, Typography } from '@mui/material';
import { startCase } from 'lodash-es';
import { useMemo, useState } from 'react';
import { useController, useWatch } from 'react-hook-form';
import { FormItemControl } from '../types';
import { useLocalConstantsPickList } from '../useLocalConstantsPickList';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import { FALSE_OPT, TRUE_OPT } from '@/components/elements/input/YesNoRadio';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import { usePickList } from '@/modules/form/hooks/usePickList';
import { ItemMap } from '@/modules/form/types';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import {
  COMPARABLE_ITEM_TYPES,
  getItemCategory,
} from '@/modules/formBuilder/formBuilderUtil';
import { HmisEnums } from '@/types/gqlEnums';
import {
  EnableOperator,
  EnableWhen,
  FormItem,
  ItemType,
  PickListOption,
} from '@/types/gqlTypes';

interface EnableWhenConditionProps {
  control: FormItemControl;
  index: number;
  itemPickList: PickListOption[];
  itemMap: ItemMap;
  enableWhenPath?: 'enableWhen' | `autofillValues.${number}.autofillWhen`; // path to enableWhen in form
}

const validOperatorsForType = (type: ItemType, repeats: boolean) => {
  const operators = [];

  if (getItemCategory(type) === 'question') {
    if (repeats) {
      // this question has multiple answers, so we use "includes" to evaluate whether the list includes the comparison value
      operators.push(EnableOperator.Includes);
    } else {
      // compare if answer is equal to comparison value
      operators.push(EnableOperator.Equal);
    }
    // "exists" evaluates whether the question has a current value or not. Doesn't really make sense for boolean, since you would just use value=true
    if (type !== ItemType.Boolean) operators.push(EnableOperator.Exists);
  }
  if (type === ItemType.Choice) {
    // compare this question's answer to a list of `answerCodes`
    operators.push(EnableOperator.In);
  }

  if (COMPARABLE_ITEM_TYPES.includes(type)) {
    operators.push(EnableOperator.GreaterThan);
    operators.push(EnableOperator.LessThan);
    operators.push(EnableOperator.GreaterThanEqual);
    operators.push(EnableOperator.LessThanEqual);
  }

  // any item type supports enableWhen, so we can always evaluate the condition of whether the item is enabled or not
  operators.push(EnableOperator.Enabled);
  return operators;
};

export const determineEnableWhenComparisonField = (
  dependentItem: FormItem, // the item to compare to
  operator: EnableOperator // the comparison operator
):
  | Omit<keyof EnableWhen, 'operator' | 'localConstant' | 'question'>
  | undefined => {
  switch (dependentItem.type) {
    case ItemType.Choice:
    case ItemType.OpenChoice:
      // value in [x,y,z]
      if (operator === EnableOperator.In) return 'answerCodes';
      // value can be matched by code or group code.
      // answerGroupCode should probably be supported too. not turned on in the ui because it has one specific use case currently.
      return 'answerCode';
    case ItemType.Boolean:
      return 'answerBoolean';
    case ItemType.Integer:
    case ItemType.Currency:
      return 'answerNumber';
    default:
      // not handled: compareQuestion
      return 'answerCode';
  }
};

// Component for managing a single EnableWhen condition
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

  const {
    field: { onChange: onChangeOperator },
  } = useController({
    control,
    name: `${enableWhenPath}.${index}.operator`,
  });

  const dependentItem = useMemo(
    () => (state?.question ? itemMap[state?.question] : undefined),
    [itemMap, state?.question]
  );

  const localPickList = useMemo(() => {
    if (dependentItem?.pickListReference)
      return localResolvePickList(dependentItem?.pickListReference);
  }, [dependentItem]);

  const { pickList: remotePickList, loading: remotePickListLoading } =
    usePickList({
      item: {
        linkId: 'fake',
        type: ItemType.Choice,
        pickListReference: dependentItem?.pickListReference,
      },
      fetchOptions: {
        skip:
          !dependentItem || !dependentItem.pickListReference || !!localPickList,
      },
    });

  const dependentItemPickList = useMemo(() => {
    if (!dependentItem) return;
    if (dependentItem.pickListOptions) return dependentItem.pickListOptions;
    if (localPickList && localPickList.length > 0) return localPickList;
    if (remotePickList && remotePickList.length > 0) return remotePickList;
  }, [dependentItem, localPickList, remotePickList]);

  const enableOperatorPickList = useMemo(() => {
    // TODO handle local constant instead of dependentItem
    const validOperators = validOperatorsForType(
      dependentItem?.type || ItemType.Choice,
      dependentItem?.repeats || false
    );
    return Object.keys(HmisEnums.EnableOperator)
      .filter(
        (op) =>
          validOperators.includes(op as EnableOperator) ||
          state?.operator === op
      )
      .map((code) => ({
        code,
        label: startCase(code.toLowerCase()),
      }));
  }, [dependentItem, state?.operator]);

  const answerInputType = useMemo(() => {
    // We dont know the operator yet, so don't know which answer type to use
    if (!state?.operator) return;

    // We dont know the comparison type yet, so don't know which answer type to use
    if (!dependentItem && !state?.localConstant) return;

    // Exists/Enabled are always boolean
    if (
      [EnableOperator.Exists, EnableOperator.Enabled].includes(state.operator)
    ) {
      return 'answerBoolean';
    }

    // String input uses answerCode
    // TODO: handle based on selected Local Constant's type
    if (state.localConstant) return 'answerCode';
    if (!dependentItem) return;
    return determineEnableWhenComparisonField(dependentItem, state.operator);
  }, [dependentItem, state]);

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
                rules={{
                  required: 'Local Constant or Dependent Question is required',
                }}
                onChange={() => onChangeOperator(null)}
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
                onChange={() => onChangeOperator(null)}
              />
            )}
          </Stack>
        </Grid>
        {/* COLUMN 2: Select the comparison operator */}
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
        <Grid item xs={4}>
          <Stack gap={1}>
            {answerInputType === 'answerBoolean' && (
              <ControlledSelect
                name={`${enableWhenPath}.${index}.answerBoolean`}
                control={control}
                label='Value'
                options={[TRUE_OPT, FALSE_OPT]}
                setValueAs={(option) => {
                  if (option?.code === 'true') return true;
                  if (option?.code === 'false') return false;
                  return null;
                }}
                required
              />
            )}
            {answerInputType === 'answerCode' &&
              (dependentItemPickList || remotePickListLoading ? (
                <ControlledSelect
                  loading={remotePickListLoading}
                  name={`${enableWhenPath}.${index}.answerCode`}
                  control={control}
                  label='Response Value'
                  options={dependentItemPickList || []}
                  helperText={answerHelperText}
                  required
                />
              ) : (
                <ControlledTextInput
                  name={`${enableWhenPath}.${index}.answerCode`}
                  control={control}
                  label='Response Value (Code)'
                  helperText={answerHelperText}
                  required
                />
              ))}
            {answerInputType === 'answerCodes' && (
              <ControlledTextInput
                name={`${enableWhenPath}.${index}.answerCodes`}
                control={control}
                label='Response Value (Code List)'
                helperText={answerHelperText}
                required
              />
            )}
            {answerInputType === 'answerNumber' && (
              <ControlledTextInput
                name={`${enableWhenPath}.${index}.answerNumber`}
                control={control}
                label='Response Value (Numeric)'
                type='number'
                helperText={answerHelperText}
                required
              />
            )}
            {state?.answerGroupCode && (
              <ControlledTextInput
                name={`${enableWhenPath}.${index}.answerGroupCode`}
                control={control}
                label='Response Group'
                helperText='If dependent item uses a grouped picklist, enter the name of a group to compare using the operator.'
                required
              />
            )}
          </Stack>
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Typography typography='body2' fontWeight={600}>
          Advanced Options
        </Typography>
        <Stack>
          <LabeledCheckbox
            label='Compare with a Local Constant instead of a Dependent Question'
            checked={advanced.localConstant}
            sx={{ width: 'fit-content' }}
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
