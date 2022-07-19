import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Box,
  Grid,
  Button,
  Stack,
  Paper,
  Link,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';

import Field from './Field';
import { FormFieldDefinition } from './types';

import ProjectSelect from '@/components/elements/input/ProjectSelect';
import TextInput from '@/components/elements/input/TextInput';

interface SearchFormConfig {
  fields: FormFieldDefinition[];
}

interface Props {
  config: SearchFormConfig;
  onSubmit: (values: Record<string, any>) => void;
}

const SearchForm: React.FC<Props> = ({ config, onSubmit }) => {
  const [values, setValues] = useState<Record<string, any>>({});
  const [expanded, setExpanded] = useState(false);

  const fieldChanged = (fieldId: string, value: any) => {
    setValues((currentValues) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      currentValues[fieldId] = value;
      return { ...currentValues };
    });
  };

  const submitHandler = (
    event: React.FormEvent<HTMLFormElement> | React.KeyboardEvent
  ) => {
    event.preventDefault();
    console.log('Searching... ', JSON.stringify(values, null, 2));
    onSubmit(values);
  };
  const submitOnEnter = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      submitHandler(event);
    }
  };

  return (
    <Box component='form' onSubmit={submitHandler} sx={{ pb: 2 }}>
      <Typography sx={{ mb: 2, fontStyle: 'italic', color: 'darkgreen' }}>
        Search for 'ack' to get mocked results.
      </Typography>
      <Typography sx={{ mb: 2 }}>
        Search by name, D.O.B. (mm/dd/yyyy), SSN (xxx-yyy-zzzz), Warehouse ID,
        or PersonalID. It is often most efficient to search using the first few
        characters of the first name and last name, e.g. to find Jane Smith you
        might search for ja sm.
      </Typography>
      <Grid container direction='row' spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={5}>
          <TextInput
            label='Search Clients'
            placeholder='Search clients...'
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={values.searchTerm || ''}
            onChange={(e) => {
              fieldChanged('searchTerm', e.target.value);
            }}
            onKeyUp={submitOnEnter}
          />
        </Grid>
        <Grid item xs={5}>
          <ProjectSelect
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={values.projects || []}
            onChange={(selectedOption) => {
              fieldChanged('projects', selectedOption);
            }}
            multiple
          />
        </Grid>
        <Grid item xs={2}></Grid>
      </Grid>
      <Button
        variant='outlined'
        onClick={() => {
          setExpanded((old) => !old);
        }}
        sx={{ mb: 2 }}
        size='small'
      >
        Advanced Search
        {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </Button>
      {expanded && (
        <Paper sx={{ p: 2 }}>
          {/* <Typography sx={{ mb: 2 }}>Advanced Search</Typography> */}
          <Grid
            container
            direction='row'
            rowSpacing={2}
            columnSpacing={2}
            sx={{ mb: 2 }}
          >
            {config.fields.map((field) => (
              <Field
                key={field._uid}
                field={field}
                fieldChanged={fieldChanged}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                value={values[field._uid] ?? ''}
              />
            ))}
          </Grid>
          <Stack direction='row' spacing={1}>
            <Button variant='outlined' type='submit'>
              Apply
            </Button>
            <Button variant='outlined' disabled>
              Cancel
            </Button>
            <Link
              onClick={() => {
                setValues({});
              }}
              variant='caption'
              sx={{ display: 'block', pt: 1, pl: 2 }}
            >
              Clear Search
            </Link>
          </Stack>
        </Paper>
      )}
    </Box>
  );
};

export default SearchForm;
