import { IconButton } from '@mui/material';
import { Stack } from '@mui/system';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ClientTextSearchInput, {
  ClientTextSearchInputProps,
} from './ClientTextSearchInput';
import { ClearIcon, SearchIcon } from '@/components/elements/SemanticIcons';

interface Props extends Omit<ClientTextSearchInputProps, 'onChange' | 'value'> {
  initialValue?: string;
  onSearch: (value: string) => void;
  hideSearchButton?: boolean;
  minChars?: number;
  onClearSearch?: VoidFunction;
  hideClearButton?: boolean;
}

const ClientTextSearchForm: React.FC<Props> = ({
  onSearch,
  initialValue,
  hideSearchButton,
  onClearSearch,
  hideClearButton,
  minChars = 3,
  ...props
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string>(initialValue || '');
  const [tooShort, setTooShort] = useState(false);

  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialValue) setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    setHasSearched(false);
  }, [value]);

  useEffect(() => {
    if (!minChars || !tooShort) return;
    if (value && value.length >= minChars) setTooShort(false);
  }, [minChars, value, tooShort]);

  const handleSearch = useCallback(() => {
    if (minChars && (value || '').length < minChars) {
      setTooShort(true);
    } else {
      onSearch(value);
      setHasSearched(true);
    }
  }, [minChars, onSearch, value]);

  const handleClear = useCallback(() => {
    setValue('');

    if (onClearSearch) onClearSearch();
  }, [onClearSearch]);

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems='flex-start'
      gap={{ xs: 1, sm: 2 }}
    >
      <ClientTextSearchInput
        value={value}
        onChange={setValue}
        onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
        error={tooShort}
        errorMessage={
          tooShort ? t<string>('clientSearch.inputTooShort') : undefined
        }
        onClearSearch={onClearSearch}
        InputProps={{
          sx: { pr: 1 },
          endAdornment: !hasSearched ? (
            <IconButton
              size='small'
              onClick={handleSearch}
              disabled={!value}
              color='primary'
            >
              <SearchIcon />
            </IconButton>
          ) : (
            value && (
              <IconButton size='small' onClick={handleClear}>
                <ClearIcon />
              </IconButton>
            )
          ),
        }}
        {...props}
      />
    </Stack>
  );
};

export default ClientTextSearchForm;
