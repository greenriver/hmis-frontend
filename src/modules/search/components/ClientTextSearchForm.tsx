import SearchIcon from '@mui/icons-material/Search';
import { Button, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ClearSearchButton from './ClearSearchButton';
import ClientTextSearchInput, {
  ClientTextSearchInputProps,
} from './ClientTextSearchInput';
import theme from '@/config/theme';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';

interface Props extends Omit<ClientTextSearchInputProps, 'onChange' | 'value'> {
  initialValue?: string;
  onSearch: (value: string) => void;
  hideSearchButton?: boolean;
  minChars?: number;
  onClearSearch?: VoidFunction;
  hideClearButton?: boolean;
  showSearchTips?: boolean;
}

// NOTE: description should match actual behavior of ClientSearch concern in the warehouse
const defaultSearchClientsHelperText =
  'Search by name, DOB (mm/dd/yyyy), SSN (xxx-yy-zzzz), Warehouse ID, or Personal ID.';
const defaultSearchTips =
  'It is often most efficient to search using the first few characters of the first name and last name, e.g. to find Jane Smith you might search for ja sm.';

const getDefaultHelperText = (mciEnabled: boolean) => {
  return mciEnabled
    ? defaultSearchClientsHelperText.replace(
        'or Personal ID',
        'Personal ID, or MCI ID'
      )
    : defaultSearchClientsHelperText;
};

const ClientTextSearchForm: React.FC<Props> = ({
  onSearch,
  initialValue,
  hideSearchButton,
  onClearSearch,
  hideClearButton,
  minChars = 3,
  showSearchTips = false,
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

  const { globalFeatureFlags } = useHmisAppSettings();

  const helperTextNode = useMemo(() => {
    const helperText = getDefaultHelperText(!!globalFeatureFlags?.mciId);
    return showSearchTips ? (
      <span>
        <b>To add a client,</b> search first. <b>Search Tips:</b> {helperText}{' '}
        <span>{defaultSearchTips}</span>
      </span>
    ) : (
      <span>{helperText}</span>
    );
  }, [globalFeatureFlags?.mciId, showSearchTips]);

  const isXs = useIsMobile('sm');

  const buttonSx = {
    mt: isXs ? 0 : 3,
    px: 4,
    height: 'fit-content',
    top: '2px',
  };
  return (
    <Stack direction='column' spacing={2}>
      <Typography variant='body2' sx={{ color: theme.palette.text.secondary }}>
        {helperTextNode}
      </Typography>
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
    </Stack>
  );
};

export default ClientTextSearchForm;
