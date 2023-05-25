import { Grid, Stack } from '@mui/material';
import { useMemo } from 'react';

import { MAX_INPUT_WIDTH } from '../../DynamicField';
import FormSelect from '../../FormSelect';
import RequiredLabel from '../../RequiredLabel';

import { AddressInputType } from './types';

import TextInput from '@/components/elements/input/TextInput';
import { isPickListOption } from '@/modules/form/types';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import { ClientAddressType } from '@/types/gqlTypes';

const addressTypePicklist =
  localResolvePickList('ClientAddressType', false) || [];
// const addressTypePicklist = localResolvePickList('ClientAddressUse', false) || [];

const getLabel = (text: string, required?: boolean) => {
  return (
    <RequiredLabel
      text={text}
      required={required}
      TypographyProps={{
        fontWeight: 600,
      }}
    />
  );
};

const AddressInput = ({
  value,
  onChange,
}: {
  value: AddressInputType;
  onChange: (value: AddressInputType) => void;
}) => {
  const typeValue = useMemo(
    () => addressTypePicklist.find((o) => o.code == value.type) || null,
    [value]
  );

  return (
    <Stack direction={'column'} rowGap={2}>
      <Grid container gap={2}>
        <Grid item xs={3}>
          <TextInput
            value={value.line1 || null}
            onChange={(e) => onChange({ ...value, line1: e.target.value })}
            label={getLabel('Address Line 1')}
          />
        </Grid>
        <Grid item xs={3}>
          <TextInput
            value={value.line2 || null}
            onChange={(e) => onChange({ ...value, line2: e.target.value })}
            label={getLabel('Address Line 2')}
          />
        </Grid>
        <Grid item xs={3}>
          <TextInput
            value={value.city || null}
            onChange={(e) => onChange({ ...value, city: e.target.value })}
            label={getLabel('City')}
          />
        </Grid>
        <Grid item xs={2}>
          <TextInput
            value={value.state || null}
            onChange={(e) => onChange({ ...value, state: e.target.value })}
            label={getLabel('State')}
          />
        </Grid>
      </Grid>
      <FormSelect
        value={typeValue}
        options={addressTypePicklist}
        onChange={(e, val) =>
          onChange({
            ...value,
            type: isPickListOption(val)
              ? (val.code as ClientAddressType)
              : null,
          })
        }
        placeholder='Select address type..'
        textInputProps={{
          name: 'address type',
          sx: { width: MAX_INPUT_WIDTH },
        }}
        label={getLabel('Address Type')}
      />
    </Stack>
  );
};

export default AddressInput;
