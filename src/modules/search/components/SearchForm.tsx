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

import ProjectSelect, {
  Option as ProjectOption,
} from '@/components/elements/input/ProjectSelect';
import TextInput from '@/components/elements/input/TextInput';
import DynamicField from '@/modules/form/components/DynamicField';
import { transformSubmitValues } from '@/modules/form/formUtil';
import { FormDefinition, Item } from '@/modules/form/types';

type FormValues = {
  textSearch?: string;
  projects?: ProjectOption[];
  [k: string]: any;
};
interface Props {
  definition: FormDefinition;
  onSubmit: (values: Record<string, any>) => void;
}

const MAPPING_KEY = 'clientSearchInput';

const SearchForm: React.FC<Props> = ({ definition, onSubmit }) => {
  const [values, setValues] = useState<FormValues>({});
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
    // Transform values into ClientSearchInput query variables
    const variables = transformSubmitValues(definition, values, MAPPING_KEY);
    onSubmit({
      ...variables,
      textSearch: values.textSearch,
      projects: values.projects ? values.projects.map((p) => p.id) : undefined,
    });
  };
  const submitOnEnter = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      submitHandler(event);
    }
  };

  return (
    <Box component='form' onSubmit={submitHandler} sx={{ pb: 2 }}>
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
            value={values.textSearch || ''}
            onChange={(e) => {
              fieldChanged('textSearch', e.target.value);
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
            textInputProps={{ placeholder: 'Choose projects...' }}
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
            {definition.item?.map((item: Item) => (
              <DynamicField
                key={item.linkId}
                item={item}
                itemChanged={fieldChanged}
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                value={values[item.linkId] ?? ''}
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
