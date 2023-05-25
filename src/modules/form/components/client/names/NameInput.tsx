import { Box, Button, Grid, lighten, Stack } from '@mui/material';
import { ReactNode, useMemo } from 'react';

import { MAX_INPUT_WIDTH } from '../../DynamicField';
import { InfoGroup } from '../../DynamicGroup';
import FormSelect from '../../FormSelect';
import RequiredLabel from '../../RequiredLabel';

import { NameInputType } from './types';

import TextInput from '@/components/elements/input/TextInput';
import { isPickListOption } from '@/modules/form/types';
import { localResolvePickList } from '@/modules/form/util/formUtil';
import { NameDataQuality } from '@/types/gqlTypes';

const nameDqPickList = localResolvePickList('NameDataQuality', false) || [];

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

const NameInput = ({
  value,
  onChange,
  onRemove,
  radioElement,
}: {
  value: NameInputType;
  onChange: (value: NameInputType) => void;
  onRemove?: VoidFunction;
  radioElement?: ReactNode;
}) => {
  const dqValue = useMemo(
    () => nameDqPickList.find((o) => o.code == value.nameDataQuality) || null,
    [value]
  );

  return (
    <Stack
      direction={'column'}
      rowGap={2}
      sx={{
        p: 2,
        backgroundColor: (theme) => lighten(theme.palette.grey[50], 0.4),
        borderRadius: 1,
      }}
    >
      <Grid container gap={2}>
        <Grid item xs={3}>
          <TextInput
            value={value.first || null}
            onChange={(e) => onChange({ ...value, first: e.target.value })}
            label={getLabel('First Name')}
          />
        </Grid>
        <Grid item xs={3}>
          <TextInput
            value={value.middle || null}
            onChange={(e) => onChange({ ...value, middle: e.target.value })}
            label={getLabel('Middle Name')}
          />
        </Grid>
        <Grid item xs={3}>
          <TextInput
            value={value.last || null}
            onChange={(e) => onChange({ ...value, last: e.target.value })}
            label={getLabel('Last Name')}
          />
        </Grid>
        <Grid item xs={2}>
          <TextInput
            value={value.suffix || null}
            onChange={(e) => onChange({ ...value, suffix: e.target.value })}
            label={getLabel('Suffix')}
          />
        </Grid>
      </Grid>
      <Box>{radioElement}</Box>
      <InfoGroup>
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
          textInputProps={{
            name: 'name data quality',
            sx: { width: MAX_INPUT_WIDTH },
          }}
          label={getLabel('Name Data Quality')}
          // sx={{ maxWidth: MAX_INPUT_WIDTH }} // for click target for closing dropdwon
          // {...commonInputProps}
        />
      </InfoGroup>
      <Button
        onClick={() => onRemove && onRemove()}
        color='error'
        variant='text'
        disabled={!onRemove}
        sx={{ width: 'fit-content', textDecoration: 'underline', py: 0 }}
      >
        Delete Name
      </Button>
    </Stack>
  );
};

export default NameInput;
