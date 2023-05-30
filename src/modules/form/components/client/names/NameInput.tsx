import { Box, Grid, Stack } from '@mui/material';
import { ReactNode, useMemo } from 'react';

import FormSelect from '../../FormSelect';
import { getRequiredLabel } from '../../RequiredLabel';
import { NameInputType } from '../types';

import TextInput from '@/components/elements/input/TextInput';
import { isPickListOption } from '@/modules/form/types';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import { NameDataQuality } from '@/types/gqlTypes';

const nameDqPickList = localResolvePickList('NameDataQuality', false) || [];

const NameInput = ({
  value,
  onChange,
  radioElement,
}: {
  value: NameInputType;
  onChange: (value: NameInputType) => void;
  radioElement?: ReactNode;
}) => {
  const dqValue = useMemo(
    () => nameDqPickList.find((o) => o.code == value.nameDataQuality) || null,
    [value]
  );

  return (
    <Stack direction={'column'} rowGap={2}>
      <Grid container spacing={2}>
        <Grid item xs>
          <TextInput
            value={value.first || ''}
            onChange={(e) => onChange({ ...value, first: e.target.value })}
            label={getRequiredLabel('First Name')}
            data-testid='first-name'
          />
        </Grid>
        <Grid item xs>
          <TextInput
            value={value.middle || ''}
            onChange={(e) => onChange({ ...value, middle: e.target.value })}
            label={getRequiredLabel('Middle Name')}
          />
        </Grid>
        <Grid item xs>
          <TextInput
            value={value.last || ''}
            onChange={(e) => onChange({ ...value, last: e.target.value })}
            label={getRequiredLabel('Last Name')}
            data-testid='last-name'
          />
        </Grid>
        <Grid item xs={2}>
          <TextInput
            value={value.suffix || ''}
            onChange={(e) => onChange({ ...value, suffix: e.target.value })}
            label={getRequiredLabel('Suffix')}
          />
        </Grid>
      </Grid>
      <Box>{radioElement}</Box>
      <Grid container spacing={6}>
        <Grid item xs>
          <FormSelect
            value={dqValue}
            options={nameDqPickList}
            onChange={(e, dqVal) =>
              onChange({
                ...value,
                nameDataQuality: isPickListOption(dqVal)
                  ? (dqVal.code as NameDataQuality)
                  : null,
              })
            }
            placeholder='Select data quality..'
            textInputProps={{ name: 'name data quality' }}
            label={getRequiredLabel('Name Data Quality')}
          />
        </Grid>
        <Grid item xs={5}>
          <TextInput
            value={value.notes || ''}
            onChange={(e) => onChange({ ...value, notes: e.target.value })}
            label={getRequiredLabel('Notes')}
            multiline
            minRows={1}
            maxRows={5}
          />
        </Grid>
      </Grid>
    </Stack>
  );
};

export default NameInput;
