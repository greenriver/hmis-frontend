import { Grid, Stack } from '@mui/material';
import { useMemo } from 'react';

import FormSelect from '../../FormSelect';
import { getRequiredLabel } from '../../RequiredLabel';
import { PhoneInputType } from '../types';

import TextInput from '@/components/elements/input/TextInput';
import { isPickListOption } from '@/modules/form/types';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import { ClientContactPointUse } from '@/types/gqlTypes';

const contactUsePicklist =
  localResolvePickList('ClientContactPointUse', false) || [];

const PhoneInput = ({
  value,
  onChange,
}: {
  value: PhoneInputType;
  onChange: (value: PhoneInputType) => void;
}) => {
  const typeValue = useMemo(
    () => contactUsePicklist.find((o) => o.code == value.use) || null,
    [value]
  );

  return (
    <Stack direction={'column'} rowGap={0}>
      <Grid container columnSpacing={8} rowSpacing={2}>
        <Grid item xs={7}>
          <Stack rowGap={2}>
            <TextInput
              value={value.value || ''}
              onChange={(e) => onChange({ ...value, value: e.target.value })}
              label={getRequiredLabel('Phone Number')}
            />
            <FormSelect
              value={typeValue}
              options={contactUsePicklist}
              onChange={(e, val) =>
                onChange({
                  ...value,
                  use: isPickListOption(val)
                    ? (val.code as ClientContactPointUse)
                    : null,
                })
              }
              placeholder='Select phone type..'
              textInputProps={{ name: 'phone type' }}
              label={getRequiredLabel('Phone Type')}
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
            rows={5}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default PhoneInput;
