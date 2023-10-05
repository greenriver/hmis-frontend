import { Grid, Stack } from '@mui/material';
import { useMemo } from 'react';

import FormSelect from '../../FormSelect';
import { getRequiredLabel } from '../../RequiredLabel';
import { AddressInputType } from '../types';

import TextInput from '@/components/elements/input/TextInput';
import { usePickList } from '@/modules/form/hooks/usePickList';
import { isPickListOption } from '@/modules/form/types';
import {
  itemDefaults,
  localResolvePickList,
} from '@/modules/form/util/formUtil';
import { ClientAddressUse, ItemType } from '@/types/gqlTypes';

// const addressTypePicklist = localResolvePickList('ClientAddressType') || [];
const addressUsePicklist = localResolvePickList('ClientAddressUse') || [];
const fakeStateItem = {
  ...itemDefaults,
  linkId: 'fake',
  type: ItemType.Choice,
  pickListReference: 'STATE',
};

const AddressInput = ({
  value,
  onChange,
}: {
  value: AddressInputType;
  onChange: (value: AddressInputType) => void;
}) => {
  const { pickList: stateList, loading } = usePickList({ item: fakeStateItem });
  const typeValue = useMemo(
    () => addressUsePicklist.find((o) => o.code == value.use) || null,
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
              label={getRequiredLabel('Address Line 1')}
            />
            <TextInput
              value={value.line2 || ''}
              onChange={(e) => onChange({ ...value, line2: e.target.value })}
              label={getRequiredLabel('Address Line 2')}
            />
            <TextInput
              value={value.district || ''}
              onChange={(e) => onChange({ ...value, district: e.target.value })}
              label={getRequiredLabel('District (County)')}
            />
            <Stack direction='row' columnGap={2}>
              <TextInput
                value={value.city || ''}
                onChange={(e) => onChange({ ...value, city: e.target.value })}
                label={getRequiredLabel('City')}
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
                label={getRequiredLabel('State')}
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
                label={getRequiredLabel('Zip')}
                sx={{ maxWidth: '96px' }}
                max={5}
              />
            </Stack>
            <FormSelect
              value={typeValue}
              options={addressUsePicklist}
              onChange={(e, val) =>
                onChange({
                  ...value,
                  use: isPickListOption(val)
                    ? (val.code as ClientAddressUse)
                    : null,
                })
              }
              placeholder='Select address type..'
              textInputProps={{ name: 'address type' }}
              label={getRequiredLabel('Address Type')}
            />
          </Stack>
        </Grid>
        <Grid item xs={5}>
          <TextInput
            value={value.notes || ''}
            onChange={(e) => onChange({ ...value, notes: e.target.value })}
            label={getRequiredLabel('Notes')}
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
