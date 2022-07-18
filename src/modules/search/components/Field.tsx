import { Grid } from '@mui/material';
import React from 'react';

import { FormFieldDefinition } from './types';

import DatePicker from '@/components/elements/input/DatePicker';
import OrganizationSelect from '@/components/elements/input/OrganizationSelect';
import ProjectSelect from '@/components/elements/input/ProjectSelect';
import TextInput from '@/components/elements/input/TextInput';

interface Props {
  field: FormFieldDefinition;
  fieldChanged: (uid: string, value: any) => void;
  value: any;
}

const Field: React.FC<Props> = ({ field, fieldChanged, value }) => {
  switch (field.type) {
    case 'text':
      return (
        <Grid item xs={4}>
          <TextInput
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
        <Grid item xs={5}>
          <ProjectSelect
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={value || []}
            onChange={(selectedOption) => {
              fieldChanged(field._uid, selectedOption);
            }}
            isMulti
          />
        </Grid>
      );
    case 'organizationMultiSelect':
      return (
        <Grid item xs={5}>
          <OrganizationSelect
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={value || []}
            onChange={(selectedOption) => {
              fieldChanged(field._uid, selectedOption);
            }}
            isMulti
          />
        </Grid>
      );
    default:
      return <></>;
  }
};

export default Field;
