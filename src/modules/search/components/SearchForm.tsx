import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Box,
  Button,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { isEmpty, omit, omitBy, isNil, trim } from 'lodash-es';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ProjectSelect, {
  Option as ProjectOption,
} from '@/components/elements/input/ProjectSelect';
import TextInput from '@/components/elements/input/TextInput';
import DynamicField from '@/modules/form/components/DynamicField';
import { ItemChangedFn } from '@/modules/form/types';
import { transformSubmitValues } from '@/modules/form/util/formUtil';
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

  const [textSearchError, setTextSearchError] = useState<string | undefined>(
    undefined
  );

  const validateSearchFormInput = useCallback(
    (values: Record<string, any>) => {
      const errors: Record<keyof typeof values, string> = {};

      if (isEmpty(omitBy(values, (e) => isNil(e) || isEmpty(e)))) {
        errors.textSearch = t<string>('clientSearch.missingCriteria');
      } else {
        if (
          values.textSearch &&
          typeof values.textSearch === 'string' &&
          isEmpty(omit(values, ['textSearch'])) &&
          trim(values.textSearch).length < 3
        ) {
          errors.textSearch = hideAdvanced
            ? t<string>('clientSearch.inputTooShort')
            : t<string>('clientSearch.inputTooShortAllowAdvanced');
        }
      }

      return errors;
    },
    [t, hideAdvanced]
  );

  const fieldChanged = (fieldId: string, value: any) => {
    setValues((currentValues) => {
      currentValues[fieldId] = value;
      return { ...currentValues };
    });
  };
  const itemChanged: ItemChangedFn = ({ linkId, value }) => {
    setValues((currentValues) => {
      currentValues[linkId] = value;
      return { ...currentValues };
    });
  };

  // When form is submitted, transform values into query paramterse and invoke parent submit handler
  const submitHandler = useCallback(
    (event: React.FormEvent<HTMLFormElement> | React.KeyboardEvent) => {
      event.preventDefault();
      if (!definition) return;
      // Transform values into ClientSearchInput query variables
      const variables = transformSubmitValues({
        definition,
        values,
        keyByFieldName: true,
      });
      const input = {
        ...variables,
        textSearch: values.textSearch,
        ...(values.projects && {
          projects: values.projects.map((p) => p.code),
        }),
      };

      console.debug('Search', input);

      const errors = validateSearchFormInput(input);

      if (!isEmpty(errors)) {
        console.error('Invalid Search', { errors });
        if (errors.textSearch) setTextSearchError(errors.textSearch);
        return;
      } else {
        setTextSearchError(undefined);
      }

      onSubmit(input);
    },
    [values, definition, onSubmit, validateSearchFormInput]
  );

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
            <Typography>{t<string>('clientSearch.instruction')}</Typography>
          </Grid>
        </Grid>
      )}
      <Grid container>
        <Grid
          item
          gap={2}
          alignItems='start'
          sx={{ mb: 2, display: 'flex' }}
          xs={12}
          sm={12}
          md={hideProject ? 8 : 10}
          lg={hideProject ? 6 : 12}
          flexWrap='wrap'
        >
          <Grid item xs={hideProject ? 8 : 5}>
            <TextInput
              name='textSearch'
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
              helperText={textSearchError}
              error={!!textSearchError}
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
                sx={{ minWidth: '200px' }}
                textInputProps={{
                  placeholder: 'Choose projects...',
                }}
                multiple
              />
            </Grid>
          )}
          <Grid item xs={2}>
            <Button
              variant='outlined'
              type='submit'
              sx={{ mt: 3, py: 0.8, maxWidth: '150px' }}
              fullWidth
            >
              Search
            </Button>
          </Grid>
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
            sx={{
              mb: 2,
              '>.MuiGrid-item': {
                width: '250px',
                flexGrow: 1,
              },
            }}
          >
            {definition.item?.map((item: FormItem) => (
              <DynamicField
                nestingLevel={0}
                key={item.linkId}
                item={item}
                itemChanged={itemChanged}
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
