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
  value: any;
  children?: (item: Item) => ReactNode;
}

const ItemGroup = ({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) => (
  <Paper
    sx={{
      ml: 1,
      mt: 2,
      py: 1,
      px: 2,
      borderLeft: 3,
      borderLeftColor: 'primary.light',
    }}
  >
    {title && <Typography sx={{ mb: 1 }}>{title}</Typography>}
    <Stack direction='column' spacing={1}>
      {children}
    </Stack>
  </Paper>
);

const DynamicField: React.FC<Props> = ({
  item,
  itemChanged,
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
        <ItemGroup title={item.text}>
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
        <Grid item sx={{ width: 200 }}>
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
