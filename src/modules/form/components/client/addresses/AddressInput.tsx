import { Grid, Stack } from '@mui/material';
import { useMemo } from 'react';

import FormSelect from '../../FormSelect';
import RequiredLabel from '../../RequiredLabel';
import { AddressInputType } from '../types';

import TextInput from '@/components/elements/input/TextInput';
import { usePickList } from '@/modules/form/hooks/usePickList';
import { isPickListOption } from '@/modules/form/types';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import { ClientAddressType, ItemType } from '@/types/gqlTypes';

const addressTypePicklist =
  localResolvePickList('ClientAddressType', false) || [];
// const addressTypePicklist = localResolvePickList('ClientAddressUse', false) || [];

const fakeStateItem = {
  linkId: 'fake',
  type: ItemType.Choice,
  pickListReference: 'STATE',
};

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
  const [stateList, loading] = usePickList(fakeStateItem);
  const typeValue = useMemo(
    () => addressTypePicklist.find((o) => o.code == value.addressType) || null,
    [value]
  );
  const stateValue = useMemo(
    () =>
      (stateList || []).find((o) => o.code == value.state) ||
      (value.state
        ? {
            code: value.state,
          }
        : null),
    [stateList, value]
  );
  return (
    <Stack direction={'column'} rowGap={0}>
      <Grid container columnSpacing={8} rowSpacing={2}>
        <Grid item xs={7}>
          <Stack rowGap={2}>
            <TextInput
              value={value.line1 || ''}
              onChange={(e) => onChange({ ...value, line1: e.target.value })}
              label={getLabel('Address Line 1')}
            />
            <TextInput
              value={value.line2 || ''}
              onChange={(e) => onChange({ ...value, line2: e.target.value })}
              label={getLabel('Address Line 2')}
            />
            <TextInput
              value={value.district || ''}
              onChange={(e) => onChange({ ...value, district: e.target.value })}
              label={getLabel('District (County)')}
            />
            <Stack direction='row' columnGap={2}>
              <TextInput
                value={value.city || ''}
                onChange={(e) => onChange({ ...value, city: e.target.value })}
                label={getLabel('City')}
              />
              <FormSelect
                value={stateValue || null}
                options={stateList || []}
                onChange={(e, val) =>
                  onChange({
                    ...value,
                    state: isPickListOption(val) ? val.code : null,
                  })
                }
                label={getLabel('State')}
                loading={loading}
                textInputProps={{
                  name: 'state',
                  sx: { width: '96px' },
                }}
                autoHighlight
              />
              <TextInput
                value={value.postalCode || ''}
                onChange={(e) =>
                  onChange({ ...value, postalCode: e.target.value })
                }
                label={getLabel('Zip')}
                sx={{ maxWidth: '96px' }}
                max={5}
              />
            </Stack>
            <FormSelect
              value={typeValue}
              options={addressTypePicklist}
              onChange={(e, val) =>
                onChange({
                  ...value,
                  addressType: isPickListOption(val)
                    ? (val.code as ClientAddressType)
                    : null,
                })
              }
              placeholder='Select address type..'
              textInputProps={{ name: 'address type' }}
              label={getLabel('Address Type')}
            />
          </Stack>
        </Grid>
        <Grid item xs={5}>
          <TextInput
            value={value.notes || ''}
            onChange={(e) => onChange({ ...value, notes: e.target.value })}
            label={getLabel('Notes')}
            multiline
            sx={{
              width: '100%',
              height: '100%',
              '.MuiInputBase-root': { height: '100%' },
            }}
            rows={16}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default AddressInput;
