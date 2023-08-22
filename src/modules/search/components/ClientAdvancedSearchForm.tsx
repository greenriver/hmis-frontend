import { Button, Grid, Paper } from '@mui/material';
import { Stack } from '@mui/system';

import React, { useCallback, useEffect, useState } from 'react';
import { keySearchParamsByLinkId } from '../searchUtil';
import { ClearSearchButton } from './ClientTextSearchInput';
import DynamicField from '@/modules/form/components/DynamicField';
import { SearchFormDefinition } from '@/modules/form/data';

import { FormValues, ItemChangedFn } from '@/modules/form/types';
import { transformSubmitValues } from '@/modules/form/util/formUtil';
import { ClientSearchInput, FormItem, ItemType } from '@/types/gqlTypes';
interface Props {
  initialValues?: ClientSearchInput;
  onSearch: (values: ClientSearchInput) => void;
  onClearSearch: VoidFunction;
}
const ClientSearchAdvancedForm: React.FC<Props> = ({
  initialValues,
  onSearch,
  onClearSearch,
}) => {
  const [values, setValues] = useState<FormValues>(
    keySearchParamsByLinkId(initialValues)
  );

  useEffect(() => {
    if (initialValues) setValues(keySearchParamsByLinkId(initialValues));
  }, [initialValues]);

  const itemChanged: ItemChangedFn = ({ linkId, value }) => {
    setValues((currentValues) => {
      currentValues[linkId] = value;
      return { ...currentValues };
    });
  };

  const handleSearch = useCallback(() => {
    const variables = transformSubmitValues({
      definition: SearchFormDefinition,
      values,
      keyByFieldName: true,
    });
    onSearch(variables);
  }, [onSearch, values]);

  return (
    <Paper sx={{ p: 2 }}>
      <Grid
        container
        direction='row'
        rowSpacing={2}
        columnSpacing={2}
        sx={{
          mb: 2,
          '.HmisForm-inputContainer .MuiFormControl-root': {
            maxWidth: 'unset',
            width: '100%',
          },
          '.HmisForm-inputContainer .MuiInputBase-root': {
            maxWidth: 'unset',
            width: '100%',
          },
        }}
      >
        {SearchFormDefinition.item?.map((item: FormItem) => (
          <DynamicField
            nestingLevel={0}
            key={item.linkId}
            item={item}
            itemChanged={itemChanged}
            value={values[item.linkId] ?? ''}
            breakpoints={
              item.type === ItemType.String && item.text !== 'SSN'
                ? { xs: 6 }
                : item.text === 'SSN'
                ? { xs: 6, md: 3 }
                : { xs: 6, md: 3 }
            }
          />
        ))}
      </Grid>
      <Stack direction='row' spacing={2}>
        <Button
          variant='outlined'
          onClick={handleSearch}
          sx={{ px: 6 }}
          size='large'
        >
          Search
        </Button>
        <ClearSearchButton
          onClick={() => {
            setValues({});
            onClearSearch();
          }}
          size='large'
        />
      </Stack>
    </Paper>
  );
};
export default ClientSearchAdvancedForm;
