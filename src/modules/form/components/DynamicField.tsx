import { Grid, Stack, Paper, Typography } from '@mui/material';
import React, { ReactNode } from 'react';

import { FieldType, Item } from '../types';

import FormSelect from './FormSelect';

import DatePicker from '@/components/elements/input/DatePicker';
import OrganizationSelect from '@/components/elements/input/OrganizationSelect';
import ProjectSelect from '@/components/elements/input/ProjectSelect';
import TextInput from '@/components/elements/input/TextInput';

interface Props {
  item: Item;
  itemChanged: (uid: string, value: any) => void;
  nestingLevel: number;
  value: any;
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

const DynamicField: React.FC<Props> = ({
  item,
  itemChanged,
  nestingLevel,
  value,
  children,
}) => {
  const onChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) =>
    itemChanged(item.linkId, e.target.value);
  const onChangeValue = (val: any) => itemChanged(item.linkId, val);

  switch (FieldType[item.type]) {
    case FieldType.display:
      return <Typography variant='body2'>{item.text}</Typography>;
    case FieldType.group:
      return (
        <ItemGroup item={item} nestingLevel={nestingLevel}>
          {children && item.item?.map((childItem) => children(childItem))}
        </ItemGroup>
      );
    case FieldType.string:
    case FieldType.ssn:
      return (
        <Grid item sx={{ width: 400 }}>
          <TextInput
            id={item.linkId}
            name={item.linkId}
            label={item.text}
            value={value as string}
            onChange={onChangeEvent}
          />
        </Grid>
      );
    case FieldType.date:
    case FieldType.dob:
      return (
        <Grid item sx={{ width: 400 }}>
          <DatePicker
            label={item.text}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={value || null}
            openTo='year'
            disableFuture
            onChange={onChangeValue}
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
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              value={selectedVal}
              onChange={onChangeValue}
              multiple={item.repeats}
            />
          </Grid>
        );
      }
      return (
        <Grid item sx={{ width: 400 }}>
          <FormSelect
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={selectedVal}
            label={item.text}
            options={item.answerOption || []}
            onChange={onChangeValue}
            multiple={item.repeats}
          />
        </Grid>
      );
    default:
      return <></>;
  }
};

export default DynamicField;
