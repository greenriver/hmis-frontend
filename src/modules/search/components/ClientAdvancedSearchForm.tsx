import { Button, Grid, Paper } from '@mui/material';
import { Stack } from '@mui/system';

import { isEmpty, omit } from 'lodash-es';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  MAX_CLIENT_SEARCH_LENGTH,
  keySearchParamsByLinkId,
  tooLongSearchFields,
} from '../searchUtil';
import ClearSearchButton from './ClearSearchButton';
import DynamicField from '@/modules/form/components/DynamicField';
import { SearchFormDefinition } from '@/modules/form/data';

import { FormValues, ItemChangedFn } from '@/modules/form/types';
import { transformSubmitValues } from '@/modules/form/util/formUtil';
import {
  ClientSearchInput,
  FormItem,
  ItemType,
  ValidationError,
  ValidationSeverity,
  ValidationType,
} from '@/types/gqlTypes';
const tooLongError = (item: FormItem, message: string): ValidationError => ({
  __typename: 'ValidationError',
  attribute: item.mapping?.fieldName || item.linkId,
  linkId: item.linkId,
  message,
  fullMessage: message,
  severity: ValidationSeverity.Error,
  type: ValidationType.Invalid,
});

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
  const { t } = useTranslation();
  const [values, setValues] = useState<FormValues>(
    keySearchParamsByLinkId(initialValues)
  );
  // Client-side validation errors, keyed by link id
  const [errors, setErrors] = useState<Record<string, ValidationError[]>>({});

  useEffect(() => {
    if (initialValues) setValues(keySearchParamsByLinkId(initialValues));
  }, [initialValues]);

  const itemChanged: ItemChangedFn = ({ linkId, value }) => {
    setValues((currentValues) => {
      currentValues[linkId] = value;
      return { ...currentValues };
    });
    setErrors((currentErrors) =>
      currentErrors[linkId] ? omit(currentErrors, linkId) : currentErrors
    );
  };

  const handleSearch = useCallback(() => {
    const tooLong = tooLongSearchFields(values);
    if (!isEmpty(tooLong)) {
      const message = t('clientSearch.inputTooLong', {
        max: MAX_CLIENT_SEARCH_LENGTH,
      });
      setErrors(
        Object.fromEntries(
          tooLong.map((item) => [item.linkId, [tooLongError(item, message)]])
        )
      );
      return;
    }

    setErrors({});
    const variables = transformSubmitValues({
      definition: SearchFormDefinition,
      values,
      keyByFieldName: true,
    });
    onSearch(variables);
  }, [onSearch, values, t]);

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
            key={item.linkId}
            item={item}
            itemChanged={itemChanged}
            errors={errors[item.linkId]}
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
            setErrors({});
            onClearSearch();
          }}
          size='large'
        />
      </Stack>
    </Paper>
  );
};
export default ClientSearchAdvancedForm;
