import { Stack } from '@mui/material';
import { startCase } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import CardGroup, { RemovableCard } from './CardGroup';
import TextInput from '@/components/elements/input/TextInput';
import FormSelect from '@/modules/form/components/FormSelect';
import { ItemMap } from '@/modules/form/types';
import { HmisEnums } from '@/types/gqlEnums';
import {
  EnableBehavior,
  EnableOperator,
  EnableWhen,
  PickListOption,
} from '@/types/gqlTypes';

const enableOperatorPickList = Object.keys(HmisEnums.EnableOperator).map(
  (code) => ({
    code,
    label: startCase(code.toLowerCase()),
  })
);
const enableBehaviorPickList = Object.keys(HmisEnums.EnableBehavior).map(
  (code) => ({
    code,
    label: startCase(code.toLowerCase()),
  })
);

interface EnableWhenConditionProps {
  rule: EnableWhen;
  onChange: (rule: EnableWhen) => void;
  itemPickList: PickListOption[];
}
const EnableWhenCondition: React.FC<EnableWhenConditionProps> = ({
  rule,
  onChange,
  itemPickList,
}) => {
  //question or local_constant
  //operator
  //answer

  return (
    <Stack gap={2} flex={1} direction='row'>
      <FormSelect<false>
        label='Question'
        value={itemPickList.find((o) => o.code === rule.question) || undefined}
        options={itemPickList}
        onChange={(_e, value) => {
          if (value) onChange({ ...rule, question: value.code });
        }}
        helperText='Question whos value this condition depends on'
      />
      <FormSelect<false>
        label='Operator'
        value={
          enableOperatorPickList.find((o) => o.code === rule.operator) ||
          undefined
        }
        options={enableOperatorPickList}
        onChange={(_e, value) => {
          if (value)
            onChange({ ...rule, operator: value.code as EnableOperator });
        }}
      />
      <TextInput
        label='Answer'
        value={rule.answerCode}
        // onChange={(e) => {
        //   // Disallow typing invalid characters
        //   const regex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
        //   if (regex.test(e.target.value))
        //     onChangeProperty('linkId', e.target.value);
        // }}
        helperText='Response value to evaluate'
      />
    </Stack>
  );
};

export interface EnableWhenSelectionProps {
  enableBehavior: EnableBehavior;
  onChangeEnableBehavior: (behavior: EnableBehavior) => void;
  conditions: EnableWhen[];
  onChange: (conditions: EnableWhen[]) => void;
  itemMap: ItemMap;
}

const EnableWhenSelection: React.FC<EnableWhenSelectionProps> = ({
  enableBehavior,
  onChangeEnableBehavior,
  conditions,
  onChange,
  itemMap,
}) => {
  const addItem = useCallback(() => {
    const adjusted: EnableWhen[] = [
      ...conditions,
      { operator: EnableOperator.Equal },
    ];
    onChange(adjusted);
  }, [conditions, onChange]);

  const itemPickList = useMemo(
    () =>
      Object.values(itemMap).map((item) => {
        return {
          code: item.linkId,
          display: item.briefText || item.text,
          secondaryLabel: item.linkId,
        };
      }),
    [itemMap]
  );
  return (
    <CardGroup onAddItem={addItem} addItemText={'Add Condition'}>
      {conditions.length > 0 && (
        <FormSelect<false>
          maxWidth={150}
          label='Enable Behavior'
          value={enableBehaviorPickList.find((o) => o.code === enableBehavior)}
          options={enableBehaviorPickList}
          onChange={(_e, value) => {
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
          />
        </RemovableCard>
      ))}
    </CardGroup>
  );
};

export default EnableWhenSelection;
