import SearchIcon from '@mui/icons-material/Search';
import { Button } from '@mui/material';
import { Stack } from '@mui/system';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ClearSearchButton from './ClearSearchButton';
import ClientTextSearchInput, {
  ClientTextSearchInputProps,
} from './ClientTextSearchInput';
import { useIsMobile } from '@/hooks/useIsMobile';

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
  const isMobile = useIsMobile();

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

  const buttonSx = { mt: 3, px: 4, height: 'fit-content', top: '2px' };
  return (
    <Stack direction={'row'} alignItems='flex-start' gap={2}>
      <ClientTextSearchInput
        value={value}
        onChange={setValue}
        onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
        error={tooShort}
        errorMessage={
          tooShort ? t<string>('clientSearch.inputTooShort') : undefined
        }
        onClearSearch={onClearSearch}
        showHelperText={!isMobile}
        {...props}
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
      {onClearSearch && !hideClearButton && (
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

export default ClientTextSearchForm;
