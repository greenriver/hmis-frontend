import { Box, Grid, Button, Link } from '@mui/material';
import React, { useState } from 'react';

import Field from './Field';
import { FormFieldDefinition } from './types';

interface SearchFormConfig {
  fields: FormFieldDefinition[];
  additionalFields: FormFieldDefinition[];
}

const SearchForm = ({ config }: { config: SearchFormConfig }) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = React.useState(false);

  const fieldChanged = (fieldId: string, value: string) => {
    setValues((currentValues) => {
      currentValues[fieldId] = value;
      return { ...currentValues };
    });
  };

  const submitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.warn(values);
  };

  return (
    <Box component='form' onSubmit={submitHandler}>
      <Grid container direction='row' columnSpacing={2}>
        {config.fields.map((field) => (
          <Grid item xs={2} key={field._uid}>
            <Field
              field={field}
              fieldChanged={fieldChanged}
              value={values[field._uid] ?? ''}
            />
          </Grid>
        ))}
        <Grid item xs={2} sx={{ ml: 3 }} key='submit'>
          <Button type='submit'>Search</Button>
        </Grid>
      </Grid>
      <Box sx={{ mt: 1, mb: 1 }}>
        <Link
          onClick={() => {
            setValues({});
          }}
        >
          Clear Search
        </Link>
        <Link
          sx={{ ml: 3 }}
          onClick={() => {
            setExpanded((old) => !old);
          }}
        >
          {`${expanded ? 'Hide' : 'Show'} Advanced Search`}
        </Link>
      </Box>

      <Grid
        container
        direction='row'
        columnSpacing={2}
        sx={{ display: expanded ? undefined : 'none' }}
      >
        {config.additionalFields.map((field) => (
          <Grid item xs={2} key={field._uid}>
            <Field
              field={field}
              fieldChanged={fieldChanged}
              value={values[field._uid] ?? ''}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SearchForm;
