import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { Button, ButtonProps, InputAdornment } from '@mui/material';
import { Stack } from '@mui/system';
import { isNull } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TextInput, {
  TextInputProps,
} from '@/components/elements/input/TextInput';
import RequiredLabel from '@/modules/form/components/RequiredLabel';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';

interface Props extends TextInputProps {
  searchAdornment?: boolean;
  showSearchTips?: boolean;
  errorMessage?: string;
}

// NOTE: we should use translations for variations (like adding MCI ID) but its not set up yet for multiple envs

const defaultSearchClientsPlaceholder =
  'Search by name, DOB, SSN, or Personal ID';
// NOTE: description should match actual behavior of ClientSearch concern in the warehouse
const defaultSearchClientsHelperText =
  'Search by name, DOB (mm/dd/yyyy), SSN (xxx-yy-zzzz), Warehouse ID, or Personal ID.';
const defaultSearchTips =
  'It is often most efficient to search using the first few characters of the first name and last name, e.g. to find Jane Smith you might search for ja sm.';

const getDefaultPlaceholderAndHelper = (mciEnabled: boolean) => {
  if (!mciEnabled) {
    return {
      placeholder: defaultSearchClientsPlaceholder,
      helper: defaultSearchClientsHelperText,
    };
  } else {
    return {
      placeholder: defaultSearchClientsPlaceholder.replace(
        'or Personal ID',
        'Personal ID, or MCI ID'
      ),
      helper: defaultSearchClientsHelperText.replace(
        'or Personal ID',
        'Personal ID, or MCI ID'
      ),
    };
  }
};

const ClientTextSearchInput: React.FC<Props> = ({
  searchAdornment,
  showSearchTips = false,
  errorMessage,
  helperText: helperTextProp,
  ...props
}) => {
  const { globalFeatureFlags } = useHmisAppSettings();

  const [placeholder, helperText] = useMemo(() => {
    const { placeholder, helper } = getDefaultPlaceholderAndHelper(
      !!globalFeatureFlags?.mciId
    );
    // Construct helper text.
    // Even if helperText passed is `null`, we still need to show the `errorMessage` if present.

    const helperTextElement =
      helperTextProp || isNull(helperTextProp) ? helperTextProp : <>{helper}</>;
    const helperTextNode = showSearchTips ? (
      <>
        <Stack
          sx={{ mt: 1.5, px: 1, typography: 'body2' }}
          component='span'
          gap={2}
        >
          {errorMessage && <b>{errorMessage}</b>}
          <span>
            <b>To add a client,</b> search first. <b>Search Tips:</b>{' '}
            {helperTextElement} <span>{defaultSearchTips}</span>
          </span>
        </Stack>
      </>
    ) : (
      <Stack gap={0.5} component='span'>
        {errorMessage && <span>{errorMessage}</span>}
        <span>{helperTextElement}</span>
      </Stack>
    );

    return [placeholder, helperTextNode];
  }, [errorMessage, globalFeatureFlags?.mciId, helperTextProp, showSearchTips]);

  return (
    <TextInput
      label={
        <RequiredLabel
          text='Search Clients'
          TypographyProps={{ fontWeight: 600 }}
        />
      }
      name='search client'
      placeholder={placeholder}
      helperText={helperText}
      {...props}
      InputProps={{
        startAdornment: searchAdornment ? (
          <InputAdornment position='start'>
            <SearchIcon color='disabled' />
          </InputAdornment>
        ) : undefined,
        ...props.InputProps,
        inputProps: {
          'data-testid': 'clientSearchInput',
          ...props.InputProps?.inputProps,
        },
      }}
    />
  );
};

export const ClearSearchButton: React.FC<ButtonProps> = (props) => {
  return (
    <Button
      variant='gray'
      startIcon={<ClearIcon />}
      {...props}
      sx={{ px: 3, ...props.sx }}
    >
      {props.children || <>Clear Search</>}
    </Button>
  );
};

export const ClientTextSearchInputForm: React.FC<
  Omit<Props, 'onChange' | 'value'> & {
    initialValue?: string;
    onSearch: (value: string) => void;
    hideSearchButton?: boolean;
    minChars?: number;
    onClearSearch?: VoidFunction;
    clearButtonLocation?: 'inside_input' | 'outside_input';
  }
> = ({
  onSearch,
  initialValue,
  hideSearchButton,
  onClearSearch,
  clearButtonLocation,
  minChars = 3,
  ...props
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string>(initialValue || '');
  const [tooShort, setTooShort] = useState(false);

  useEffect(() => {
    if (initialValue) setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (!minChars || !tooShort) return;
    if (value && value.length >= minChars) setTooShort(false);
  }, [minChars, value, tooShort]);

  const handleSearch = useCallback(() => {
    if (minChars && (value || '').length < minChars) {
      setTooShort(true);
    } else {
      onSearch(value);
    }
  }, [minChars, onSearch, value]);

  const handleClear = useCallback(() => {
    setValue('');
    if (onClearSearch) onClearSearch();
  }, [onClearSearch]);

  const InputProps =
    onClearSearch && value && clearButtonLocation === 'inside_input'
      ? {
          endAdornment: (
            <Button
              variant='text'
              sx={{ color: 'text.disabled', width: '200px' }}
              startIcon={<ClearIcon />}
              onClick={handleClear}
            >
              Clear Search
            </Button>
          ),
          ...props.InputProps,
        }
      : props.InputProps;

  const buttonSx = { mt: 3, px: 4, height: 'fit-content' };
  return (
    <Stack direction={'row'} alignItems='flex-start' gap={2}>
      <ClientTextSearchInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
        error={tooShort}
        errorMessage={
          tooShort ? t<string>('clientSearch.inputTooShort') : undefined
        }
        {...props}
        InputProps={InputProps}
      />

      {!hideSearchButton && (
        <Button
          startIcon={<SearchIcon />}
          sx={buttonSx}
          variant='outlined'
          onClick={handleSearch}
        >
          Search
        </Button>
      )}
      {onClearSearch && clearButtonLocation === 'outside_input' && (
        <ClearSearchButton
          onClick={handleClear}
          sx={buttonSx}
          disabled={!value}
        >
          Clear
        </ClearSearchButton>
      )}
    </Stack>
  );
};

export default ClientTextSearchInput;
