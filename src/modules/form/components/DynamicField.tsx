import { Grid, Paper, Stack, Typography } from '@mui/material';
import React, { ReactNode } from 'react';

import { resolveAnswerValueSet } from '../formUtil';
import { FieldType, Item } from '../types';

import CreatableFormSelect from './CreatableFormSelect';
import FormSelect from './FormSelect';

import DatePicker from '@/components/elements/input/DatePicker';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import OrganizationSelect from '@/components/elements/input/OrganizationSelect';
import ProjectSelect from '@/components/elements/input/ProjectSelect';
import TextInput from '@/components/elements/input/TextInput';

interface Props {
  item: Item;
  itemChanged: (uid: string, value: any) => void;
  nestingLevel: number;
  value: any;
  disabled?: boolean;
  children?: (item: Item) => ReactNode;
}

const ItemGroup = ({
  children,
  item,
  nestingLevel,
}: {
  children: ReactNode;
  item: Item;
  nestingLevel: number;
}) => {
  const direction = item.display?.direction ?? 'column';
  const wrappedChildren = (
    <Stack direction={direction} spacing={direction === 'column' ? 1 : 2}>
      {children}
    </Stack>
  );
  if (nestingLevel === 0) {
    return (
      <Paper
        sx={{
          ml: 1,
          mt: 2,
          py: 2,
          px: 2,
          borderLeft: 3,
          borderLeftColor: 'primary.light',
        }}
      >
        {item.text && <Typography sx={{ mb: 1 }}>{item.text}</Typography>}
        {wrappedChildren}
      </Paper>
    );
  } else {
    return (
      <>
        {item.text && <Typography sx={{ mb: 1 }}>{item.text}</Typography>}
        {wrappedChildren}
      </>
    );
  }
};

const getLabel = (item: Item) => {
  if (!item.prefix && !item.text) return undefined;
  if (!item.prefix) return item.text;
  return `${item.prefix} ${item.text || ''}`;
};

const DynamicField: React.FC<Props> = ({
  item,
  itemChanged,
  nestingLevel,
  value,
  disabled = false,
  children,
}) => {
  const onChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) =>
    itemChanged(item.linkId, e.target.value);
  const onChangeValue = (val: any) => itemChanged(item.linkId, val);
  const onChangeEventValue = (_: any, val: any) =>
    itemChanged(item.linkId, val);
  const label = getLabel(item);

  switch (FieldType[item.type]) {
    case FieldType.display:
      return <Typography variant='body2'>{label}</Typography>;
    case FieldType.group:
      return (
        <ItemGroup item={item} nestingLevel={nestingLevel}>
          {children && item.item?.map((childItem) => children(childItem))}
        </ItemGroup>
      );
    case FieldType.boolean:
      return (
        <Grid item sx={{ width: 400 }}>
          <LabeledCheckbox
            checked={!!value}
            onChange={(e) =>
              itemChanged(item.linkId, (e.target as HTMLInputElement).checked)
            }
            id={item.linkId}
            name={item.linkId}
            label={label}
            disabled={disabled}
          />
        </Grid>
      );
    case FieldType.string:
    case FieldType.text:
    case FieldType.ssn:
      const multiline = FieldType[item.type] === FieldType.text;
      return (
        <Grid item sx={{ width: 400 }}>
          <TextInput
            id={item.linkId}
            name={item.linkId}
            label={label}
            value={value as string}
            onChange={onChangeEvent}
            disabled={disabled}
            multiline={multiline}
            minRows={multiline ? 3 : undefined}
          />
        </Grid>
      );
    case FieldType.date:
    case FieldType.dob:
      return (
        <Grid item sx={{ width: 400 }}>
          <DatePicker
            label={label}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={value || null}
            openTo='year'
            disableFuture
            onChange={onChangeValue}
            disabled={disabled}
          />
        </Grid>
      );
    case FieldType.openchoice:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const selectedChoiceVal = value ? value : item.repeats ? [] : null;
      return (
        <Grid item sx={{ width: 400 }}>
          <CreatableFormSelect
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={selectedChoiceVal}
            label={label}
            options={
              item.answerValueSet
                ? resolveAnswerValueSet(item.answerValueSet)
                : item.answerOption || []
            }
            onChange={onChangeEventValue}
            multiple={item.repeats}
            disabled={disabled}
          />
        </Grid>
      );
    case FieldType.choice:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const selectedVal = value ? value : item.repeats ? [] : null;
      //TODO get from initialOption
      if (
        item.answerValueSet &&
        ['projects', 'organizations'].includes(item.answerValueSet)
      ) {
        const SelectComponent =
          item.answerValueSet === 'projects'
            ? ProjectSelect
            : OrganizationSelect;
        return (
          <Grid item sx={{ width: 400 }}>
            <SelectComponent
              label={label}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              value={selectedVal}
              onChange={onChangeEventValue}
              multiple={item.repeats}
              disabled={disabled}
            />
          </Grid>
        );
      }
      return (
        <Grid item sx={{ width: 400 }}>
          <FormSelect
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={selectedVal}
            label={label}
            options={
              item.answerValueSet
                ? resolveAnswerValueSet(item.answerValueSet)
                : item.answerOption || []
            }
            onChange={onChangeEventValue}
            multiple={item.repeats}
            disabled={disabled}
          />
        </Grid>
      );
    default:
      return <></>;
  }
};

export default DynamicField;
