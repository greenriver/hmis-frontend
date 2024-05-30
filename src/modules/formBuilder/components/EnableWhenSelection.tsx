import { Box, Button, IconButton, Stack } from '@mui/material';
import { startCase } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import CollapsibleList from '@/components/elements/CollapsibleList';
import TextInput from '@/components/elements/input/TextInput';
import { AddIcon, CloseIcon } from '@/components/elements/SemanticIcons';
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
  onRemove: VoidFunction;
  itemPickList: PickListOption[];
}
const EnableWhenCondition: React.FC<EnableWhenConditionProps> = ({
  rule,
  onChange,
  onRemove,
  itemPickList,
}) => {
  //question or local_constant
  //operator
  //answer

  return (
    <Stack
      gap={2}
      direction='row'
      sx={{
        border: '1px solid white',
        borderRadius: 1,
        borderColor: 'borders.light',
        mb: 1,
      }}
      p={2}
    >
      <Stack gap={2} flex={1}>
        <FormSelect<false>
          label='Question'
          value={
            itemPickList.find((o) => o.code === rule.question) || undefined
          }
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
      <Box>
        <ButtonTooltipContainer title='Remove Condition'>
          <IconButton onClick={onRemove} size='small'>
            <CloseIcon fontSize='small' />
          </IconButton>
        </ButtonTooltipContainer>
      </Box>
    </Stack>
  );
};

interface EnableWhenSelectionProps {
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
    <CollapsibleList title='Conditional Show/Hide'>
      <Stack gap={2} sx={{ pt: 1 }}>
        {conditions.length > 0 && (
          <FormSelect<false>
            label='Enable Behavior'
            value={enableBehaviorPickList.find(
              (o) => o.code === enableBehavior
            )}
            options={enableBehaviorPickList}
            onChange={(_e, value) => {
              if (value) onChangeEnableBehavior(value.code as EnableBehavior);
            }}
          />
        )}
        {conditions.map((condition, index) => (
          <EnableWhenCondition
            key={JSON.stringify(condition)}
            rule={condition}
            onChange={(rule) => {
              const adjusted = [...conditions];
              adjusted[index] = rule;
              onChange(adjusted);
            }}
            itemPickList={itemPickList}
            onRemove={() => {
              const adjusted = [...conditions];
              adjusted.splice(index, 1);
              onChange(adjusted);
            }}
          />
        ))}
      </Stack>

      <Button
        onClick={addItem}
        color='secondary'
        variant='text'
        sx={{ width: 'fit-content', color: 'links', mb: 2 }}
        startIcon={<AddIcon />}
      >
        Add Condition
      </Button>
    </CollapsibleList>
  );
};

export default EnableWhenSelection;
