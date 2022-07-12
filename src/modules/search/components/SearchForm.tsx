// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box, Grid, Button, Link } from '@mui/material';
import React, { useState } from 'react';

import Field from './Field';
import { FormFieldDefinition } from './types';

interface SearchFormConfig {
  fields: FormFieldDefinition[];
  additionalFields: FormFieldDefinition[];
}

interface Props {
  config: SearchFormConfig;
  onSubmit: (values: Record<string, any>) => void;
}

const SearchForm: React.FC<Props> = ({ config, onSubmit }) => {
  const [values, setValues] = useState<Record<string, any>>({});
  // const [expanded, setExpanded] = React.useState(false);

  const fieldChanged = (fieldId: string, value: string) => {
    setValues((currentValues) => {
      currentValues[fieldId] = value;
      return { ...currentValues };
    });
  };

  const submitHandler = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <Box component='form' onSubmit={submitHandler} sx={{ pt: 2, pb: 2 }}>
      <Grid container direction='row' columnSpacing={2} sx={{ mb: 2 }}>
        {config.fields.map((field) => (
          <Field
            key={field._uid}
            field={field}
            fieldChanged={fieldChanged}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={values[field._uid] ?? ''}
          />
        ))}
        {/* <Grid item xs={0} key='advanced'>
          <Button
            variant='outlined'
            onClick={() => {
              setExpanded((old) => !old);
            }}
          >
            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </Button>
        </Grid> */}
      </Grid>
      <Grid
        container
        direction='row'
        columnSpacing={2}
        sx={{ mb: 2 }}
        // sx={{ display: expanded ? undefined : 'none' }}
      >
        {/* <Grid item xs={12} sx={{ mb: 1.5, fontStyle: 'italic', fontSize: 14 }}>
          Advanced Search Options
        </Grid> */}
        {config.additionalFields.map((field) => (
          <Field
            key={field._uid}
            field={field}
            fieldChanged={fieldChanged}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={values[field._uid] ?? ''}
          />
        ))}
      </Grid>
      <Grid item xs={2} key='submit'>
        <Button type='submit'>Search</Button>
        <Link
          onClick={() => {
            setValues({});
          }}
          variant='caption'
          sx={{ display: 'block', mt: 1 }}
        >
          Clear Search
        </Link>
      </Grid>
    </Box>
  );
};

export default SearchForm;
