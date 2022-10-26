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
import { isEmpty, omit } from 'lodash-es';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ProjectSelect, {
  Option as ProjectOption,
} from '@/components/elements/input/ProjectSelect';
import TextInput from '@/components/elements/input/TextInput';
import DynamicField from '@/modules/form/components/DynamicField';
import { transformSubmitValues } from '@/modules/form/formUtil';
import { FormDefinitionJson, FormItem } from '@/types/gqlTypes';

type FormValues = {
  textSearch?: string;
  projects?: ProjectOption[];
  [k: string]: any;
};
export interface SearchFormProps {
  definition: FormDefinitionJson;
  onSubmit: (values: Record<string, any>) => void;
  initialValues?: Record<string, any>;
  hideInstructions?: boolean;
  hideProject?: boolean;
  hideAdvanced?: boolean;
}

const defaultSearchKeys = ['textSearch', 'projects'];

const SearchForm: React.FC<SearchFormProps> = ({
  definition,
  onSubmit,
  initialValues,
  hideInstructions = false,
  hideProject = false,
  hideAdvanced = false,
}) => {
  const { t } = useTranslation();
  const [values, setValues] = useState<FormValues>(initialValues || {});

  // If advanced parameters were specified in the URL parameters, expand the panel
  const hasInitialAdvanced = !isEmpty(omit(initialValues, defaultSearchKeys));
  const [expanded, setExpanded] = useState(hasInitialAdvanced);

  const fieldChanged = (fieldId: string, value: any) => {
    setValues((currentValues) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      currentValues[fieldId] = value;
      return { ...currentValues };
    });
  };

  // When form is submitted, transform values into query paramterse and invoke parent submit handler
  const submitHandler = useMemo(() => {
    return (event: React.FormEvent<HTMLFormElement> | React.KeyboardEvent) => {
      event.preventDefault();
      // Transform values into ClientSearchInput query variables
      const variables = transformSubmitValues({
        definition,
        values,
      });
      onSubmit({
        ...variables,
        textSearch: values.textSearch,
        ...(values.projects && {
          projects: values.projects.map((p) => p.code),
        }),
      });
    };
  }, [values, definition, onSubmit]);

  const submitOnEnter = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      submitHandler(event);
    }
  };

  return (
    <Box component='form' onSubmit={submitHandler} sx={{ pb: 2 }}>
      {!hideInstructions && (
        <Grid container sx={{ mb: 2 }}>
          <Grid item xs={9}>
            <Typography>{t('clientSearch.instruction')}</Typography>
          </Grid>
        </Grid>
      )}
      <Grid container direction='row' spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={5}>
          <TextInput
            label='Search Clients'
            placeholder={
              hideInstructions
                ? 'Search by name, DOB, SSN, or Personal ID'
                : 'Search clients...'
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            value={values.textSearch || ''}
            onChange={(e) => {
              fieldChanged('textSearch', e.target.value);
            }}
            onKeyUp={submitOnEnter}
          />
        </Grid>
        {!hideProject && (
          <Grid item xs={4}>
            <ProjectSelect
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              value={values.projects || []}
              onChange={(_, selectedOption) => {
                fieldChanged('projects', selectedOption);
              }}
              textInputProps={{ placeholder: 'Choose projects...' }}
              multiple
            />
          </Grid>
        )}
        <Grid item xs={2}>
          <Button variant='outlined' type='submit' sx={{ mt: 3 }}>
            Search
          </Button>
        </Grid>
      </Grid>
      {!hideAdvanced && (
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
      )}
      {expanded && (
        <Paper sx={{ p: 2 }}>
          <Grid
            container
            direction='row'
            rowSpacing={2}
            columnSpacing={2}
            sx={{ mb: 2 }}
          >
            {definition.item?.map((item: FormItem) => (
              <DynamicField
                nestingLevel={0}
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
