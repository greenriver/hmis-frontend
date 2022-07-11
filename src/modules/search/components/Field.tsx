import React from 'react';

import { FormFieldDefinition } from './types';

import DatePicker from '@/components/elements/input/DatePicker';
import TextField from '@/components/elements/input/TextField';

interface Props {
  field: FormFieldDefinition;
  fieldChanged: (uid: string, value: any) => void;
  value: string;
}

const Field: React.FC<Props> = ({ field, fieldChanged, value }) => {
  switch (field.type) {
    case 'text':
      return (
        <TextField
          id={field._uid}
          name={field._uid}
          label={field.label}
          value={value}
          onChange={(e) => {
            fieldChanged(field._uid, e.target.value);
          }}
        />
      );
    case 'date':
      return (
        <DatePicker
          label={field.label}
          value={value || null}
          openTo='year'
          disableFuture
          onChange={(newValue) => {
            console.warn(newValue);
            fieldChanged(field._uid, newValue);
          }}
        />
      );
    default:
      return <></>;
  }
};

export default Field;
