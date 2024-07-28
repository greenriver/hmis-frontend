import { Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { Controller, useWatch } from 'react-hook-form';
import { FormItemControl } from '../types';
import { useLocalConstantsPickList } from '../useLocalConstantsPickList';
import { useItemPickList } from './useItemPickList';
import DatePicker from '@/components/elements/input/DatePicker';
import ControlledSelect from '@/modules/form/components/rhf/ControlledSelect';
import ControlledTextInput from '@/modules/form/components/rhf/ControlledTextInput';
import { ItemMap } from '@/modules/form/types';
import { formatDateForGql, parseHmisDateString } from '@/modules/hmis/hmisUtil';
import { BoundType, ItemType, ValidationSeverity } from '@/types/gqlTypes';

interface Props {
  control: FormItemControl;
  itemMap: ItemMap;
  index: number;
}

const ValueBoundCard: React.FC<Props> = ({ control, itemMap, index }) => {
  const fieldType = useWatch({ control, name: 'type' });
  const boundTypeValue = useWatch({ control, name: `bounds.${index}.type` });
  const labelPrefix =
    boundTypeValue === BoundType.Max
      ? 'Maximum'
      : boundTypeValue === BoundType.Min
        ? 'Minimum'
        : 'Bound';

  const localConstantsPickList = useLocalConstantsPickList();
  const itemPickList = useItemPickList({
    control,
    itemMap,
    // you can only use another question as a bound if it has the same type
    filterItems: (item) => item.type === fieldType,
  });
  return (
    <Stack gap={2}>
      <Stack direction='row' gap={2}>
        <ControlledSelect
          name={`bounds.${index}.type`}
          control={control}
          label='Bound Type'
          placeholder='Select Bound Type'
          options={[
            { code: BoundType.Min, label: 'Min' },
            { code: BoundType.Max, label: 'Max' },
          ]}
          required
          fullWidth
        />
        <ControlledSelect
          name={`bounds.${index}.severity`}
          control={control}
          label='Severity'
          placeholder='Select Severity'
          options={[
            { code: ValidationSeverity.Error, label: 'Error' },
            { code: ValidationSeverity.Warning, label: 'Warning' },
          ]}
          required
          fullWidth
        />
      </Stack>
      <Typography variant='body2'>
        Enter <b>one</b> of the below fields to specify the{' '}
        {labelPrefix.toLowerCase()} value:
      </Typography>
      {fieldType === ItemType.Date && (
        <Controller
          name={`bounds.${index}.valueDate`}
          control={control}
          render={({ field: { ref, ...field } }) => (
            <DatePicker
              {...field}
              textInputProps={{ inputRef: ref }}
              value={parseHmisDateString(field.value)}
              onChange={(date) =>
                field.onChange(date ? formatDateForGql(date) : '')
              }
              label={`${labelPrefix} Date`}
            />
          )}
        />
      )}
      {fieldType &&
        [ItemType.Integer, ItemType.Currency].includes(fieldType) && (
          <ControlledTextInput
            control={control}
            name={`bounds.${index}.valueNumber`}
            type='number'
            label={`${labelPrefix} Value`}
          />
        )}

      <ControlledSelect
        name={`bounds.${index}.valueLocalConstant`}
        control={control}
        label={`Local Constant for ${labelPrefix} Value`}
        placeholder='Select local constant'
        options={localConstantsPickList}
      />
      {itemPickList.length > 0 && (
        <ControlledSelect
          name={`bounds.${index}.question`}
          control={control}
          label={`Dependent Question for ${labelPrefix} Value`}
          placeholder='Select question'
          helperText='The response to this question will be the bound value'
          options={itemPickList}
        />
      )}

      <Typography variant='body2'>
        Optionally specify an offset for the bound. For example, specifying a
        maximum with value "Today" with offset "3" will set the maximum bound to
        3 days in the future.
      </Typography>
      <ControlledTextInput
        control={control}
        name={`bounds.${index}.offset`}
        type='number'
        label='Offset'
        helperText={
          fieldType === ItemType.Date
            ? 'Number of days to offset the bound value'
            : 'Number to offset the bound value'
        }
      />
    </Stack>
  );
};

export default ValueBoundCard;
