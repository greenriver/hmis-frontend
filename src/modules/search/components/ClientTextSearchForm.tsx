import SearchIcon from '@mui/icons-material/Search';
import { Button, ButtonProps } from '@mui/material';
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
  // Must match MAX_STRING_LENGTH in ClientSearchQueryShared on the server, which rejects the search
  maxChars?: number;
  onClearSearch?: VoidFunction;
  hideClearButton?: boolean;
  ClearButtonProps?: ButtonProps;
}

const ClientTextSearchForm: React.FC<Props> = ({
  onSearch,
  initialValue,
  hideSearchButton,
  onClearSearch,
  hideClearButton,
  minChars = 3,
  maxChars = 100,
  ClearButtonProps,
  ...props
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<string>(initialValue || '');
  const [tooShort, setTooShort] = useState(false);
  const [tooLong, setTooLong] = useState(false);

  useEffect(() => {
    if (initialValue) setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (!minChars || !tooShort) return;
    if (value && value.trim().length >= minChars) setTooShort(false);
  }, [minChars, value, tooShort]);

  useEffect(() => {
    if (!maxChars || !tooLong) return;
    if (value.trim().length <= maxChars) setTooLong(false);
  }, [maxChars, value, tooLong]);

  const handleSearch = useCallback(() => {
    const trimmed = (value || '').trim();
    if (minChars && trimmed.length < minChars) {
      setTooShort(true);
    } else if (maxChars && trimmed.length > maxChars) {
      setTooLong(true);
    } else {
      onSearch(value);
    }
  }, [minChars, maxChars, onSearch, value]);

  const handleClear = useCallback(() => {
    setValue('');
    if (onClearSearch) onClearSearch();
  }, [onClearSearch]);

  // Using isTiny as the breakpoint for the mobile appearance here rather than vanilla isMobile
  // gets us the search box appearing as normal/desktop (with buttons in one line) on reasonably large
  // tablet screens, but really small phone screens will still have the buttons stack correctly.
  const isTiny = useIsMobile('sm');

  const hasInputLabel = props.label !== null;
  const buttonSx = {
    mt: hasInputLabel && !isTiny ? 3 : 0, // space to account for label
    px: 4,
    height: 'fit-content',
    top: hasInputLabel ? '2px' : 0,
  };
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
        error={tooShort || tooLong}
        errorMessage={
          (tooShort && t('clientSearch.inputTooShort')) ||
          (tooLong && t('clientSearch.inputTooLong')) ||
          undefined
        }
        onClearSearch={onClearSearch}
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
          {...ClearButtonProps}
        >
          {ClearButtonProps?.children || 'Clear'}
        </ClearSearchButton>
      )}
    </Stack>
  );
};

export default ClientTextSearchForm;
