import { Grid } from '@mui/material';
import React from 'react';
import { OnChangeValue } from 'react-select';

import { FormFieldDefinition } from './types';

import DatePicker from '@/components/elements/input/DatePicker';
import ProjectSelect, {
  ProjectOptionType,
} from '@/components/elements/input/ProjectSelect';
import TextField from '@/components/elements/input/TextField';

interface Props {
  field: FormFieldDefinition;
  fieldChanged: (uid: string, value: any) => void;
  value: any;
}

const Field: React.FC<Props> = ({ field, fieldChanged, value }) => {
  switch (field.type) {
    // FIXME ssn needs input mask
    case 'text':
      return (
        <Grid item xs={2}>
          <TextField
            id={field._uid}
            name={field._uid}
            label={field.label}
            value={value as string}
            onChange={(e) => {
              fieldChanged(field._uid, e.target.value);
            }}
          />
        </Grid>
      );
    case 'date':
      return (
        <Grid item xs={2}>
          <DatePicker
            label={field.label}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={value || null}
            openTo='year'
            disableFuture
            onChange={(newValue) => {
              fieldChanged(field._uid, newValue);
            }}
          />
        </Grid>
      );
    case 'projectMultiSelect':
      return (
        <Grid item xs={3}>
          <ProjectSelect
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={value}
            onChange={(
              selectedOption: OnChangeValue<ProjectOptionType, true>
            ) => {
              // const value = selectedOption.value;
              fieldChanged(field._uid, selectedOption);
            }}
          />
        </Grid>
      );
    default:
      return <></>;
  }
};

export default Field;
