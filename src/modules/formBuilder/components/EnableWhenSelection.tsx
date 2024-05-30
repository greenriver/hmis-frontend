import { Stack } from '@mui/material';
import { startCase } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import CardGroup, { RemovableCard } from './CardGroup';
import DebouncedTextInput from '@/components/elements/input/DebouncedTextInput';
import NumberInput from '@/components/elements/input/NumberInput';
import RadioGroupInput from '@/components/elements/input/RadioGroupInput';
import YesNoRadio from '@/components/elements/input/YesNoRadio';
import FormSelect from '@/modules/form/components/FormSelect';
import { ItemMap } from '@/modules/form/types';
import { HmisEnums } from '@/types/gqlEnums';
import {
  EnableBehavior,
  EnableOperator,
  EnableWhen,
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
  rule: Partial<EnableWhen>;
  onChange: (rule: Partial<EnableWhen>) => void;
  itemPickList: PickListOption[];
  itemMap: ItemMap;
}
const EnableWhenCondition: React.FC<EnableWhenConditionProps> = ({
  rule,
  onChange,
  itemPickList,
  itemMap,
}) => {
  const dependentItem = useMemo(
    () => (rule.question ? itemMap[rule.question] : undefined),
    [itemMap, rule.question]
  );

  const answerInputTypes = useMemo(() => {
    // always boolean
    if (rule.operator === EnableOperator.Exists) return ['answerBoolean'];
    if (rule.operator === EnableOperator.Enabled) return ['answerBoolean'];

    // string input
    if (rule.localConstant) return ['answerCode'];

    // not enough information
    if (!dependentItem) return;

    if (dependentItem.type === ItemType.Choice) {
      // value in [x,y,z]
      if (rule.operator === EnableOperator.In) return ['answerCodes'];
      // value can be matched by code or group code
      return ['answerCode', 'answerGroupCode'];
    }

    if (dependentItem.type === ItemType.Boolean) return ['answerBoolean'];
    if (dependentItem.type === ItemType.Integer) return ['answerNumber'];
    if (dependentItem.type === ItemType.Currency) return ['answerNumber'];
    // not handled: compareQuestion
    return ['answerCode'];
  }, [dependentItem, rule.localConstant, rule.operator]);

  const answerHelperText =
    'Value to compare using the operator. If the expression evaluates to true, the condition is met.';
  const answerValueLabel = 'Response Value';

  const onChangeAnswerField = useCallback(
    (field: string, value: any) => {
      onChange({
        ...rule,
        // clear out all other fields, only one should be set
        answerBoolean: null,
        answerCode: null,
        answerCodes: null,
        answerGroupCode: null,
        answerNumber: null,
        [field]: value,
      });
    },
    [onChange, rule]
  );

  return (
    <Stack gap={2} flex={1}>
      <FormSelect<false>
        label='Dependent Question'
        value={itemPickList.find((o) => o.code === rule.question) || undefined}
        options={itemPickList}
        onChange={(_e, value) =>
          value
            ? onChange({ ...rule, localConstant: null, question: value.code })
            : onChange({ ...rule, question: null })
        }
        helperText="Question who's response will determine whether the condition is met"
        disabled={!!rule.localConstant}
      />
      <DebouncedTextInput
        label='Local Constant'
        value={rule.localConstant || ''}
        onChange={(str) =>
          str
            ? onChange({ ...rule, question: null, localConstant: str })
            : onChange({ ...rule, localConstant: null })
        }
        helperText="Local constant who's value will determine whether the condition is met"
        disabled={!!rule.question}
      />
      <FormSelect<false>
        label='Operator'
        value={
          enableOperatorPickList.find((o) => o.code === rule.operator) ||
          undefined
        }
        options={enableOperatorPickList}
        onChange={(_e, value) => {
          onChange({
            ...rule,
            operator: value?.code as EnableOperator | undefined,
          });
        }}
      />

      {answerInputTypes?.map((answerType) => {
        switch (answerType) {
          case 'answerBoolean':
            return (
              <YesNoRadio
                name={answerValueLabel}
                value={rule.answerBoolean}
                onChange={(val) => onChangeAnswerField('answerBoolean', val)}
              />
            );
          case 'answerCode': // fixme: should show a dropdown if we can resolve dependentItems pick list
          case 'answerGroupCode': // fixme: same as above
          case 'answerCodes': // fixme: should have its own multi-input
            return (
              <DebouncedTextInput
                label={answerValueLabel}
                value={(rule[answerType] || '') as string}
                onChange={(val) => onChangeAnswerField(answerType, val)}
                helperText={answerHelperText}
              />
            );

          case 'answerNumber':
            return (
              <NumberInput
                label={answerValueLabel}
                value={rule.answerNumber}
                onChange={(e) =>
                  onChangeAnswerField(answerType, parseInt(e.target.value))
                }
                helperText={answerHelperText}
              />
            );
        }
      })}
    </Stack>
  );
};

export interface EnableWhenSelectionProps {
  enableBehavior: EnableBehavior;
  onChangeEnableBehavior: (behavior: EnableBehavior) => void;
  conditions: Partial<EnableWhen>[];
  onChange: (conditions: Partial<EnableWhen>[]) => void;
  itemMap: ItemMap;
  variant?: 'enable' | 'autofill';
}

const EnableWhenSelection: React.FC<EnableWhenSelectionProps> = ({
  enableBehavior,
  onChangeEnableBehavior,
  conditions,
  onChange,
  itemMap,
  variant = 'enable',
}) => {
  const addItem = useCallback(() => {
    const adjusted: Partial<EnableWhen>[] = [...conditions, {}];
    onChange(adjusted);
  }, [conditions, onChange]);

  const itemPickList = useMemo(
    () =>
      Object.values(itemMap).map((item) => {
        return {
          code: item.linkId,
          label: item.briefText || item.text,
          secondaryLabel: item.linkId,
        };
      }),
    [itemMap]
  );

  const enableBehaviorOptions = useMemo(() => {
    const action =
      variant === 'enable' ? 'Display this item' : 'Autofill this value';
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
  }, [variant]);
  return (
    <CardGroup onAddItem={addItem} addItemText={'Add Condition'}>
      {conditions.length > 0 && (
        <RadioGroupInput
          label='Condition Behavior (AND/OR)'
          value={enableBehaviorOptions.find((o) => o.code === enableBehavior)}
          options={enableBehaviorOptions}
          onChange={(value) => {
            if (value) onChangeEnableBehavior(value.code as EnableBehavior);
          }}
        />
      )}
      {conditions.map((condition, index) => (
        <RemovableCard
          onRemove={() => {
            const adjusted = [...conditions];
            adjusted.splice(index, 1);
            onChange(adjusted);
          }}
          removeTooltip={'Remove Condition'}
        >
          <EnableWhenCondition
            key={JSON.stringify(condition)}
            rule={condition}
            onChange={(rule) => {
              const adjusted = [...conditions];
              adjusted[index] = rule;
              onChange(adjusted);
            }}
            itemPickList={itemPickList}
            itemMap={itemMap}
          />
        </RemovableCard>
      ))}
    </CardGroup>
  );
};

export default EnableWhenSelection;
