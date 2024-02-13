import { Stack } from '@mui/system';
import { isNull } from 'lodash-es';
import React, { useMemo } from 'react';
import RequiredLabel from '@/modules/form/components/RequiredLabel';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import CommonSearchInput, {
  CommonSearchInputProps,
} from '@/modules/search/components/CommonSearchInput';

export interface ClientTextSearchInputProps extends CommonSearchInputProps {
  showSearchTips?: boolean;
  showHelperText?: boolean;
  errorMessage?: string;
  label?: string | null;
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

const ClientTextSearchInput: React.FC<ClientTextSearchInputProps> = ({
  showSearchTips = false,
  showHelperText = true,
  errorMessage,
  helperText: helperTextProp,
  label = 'Search Clients',
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
            {showHelperText && helperTextElement}{' '}
            <span>{defaultSearchTips}</span>
          </span>
        </Stack>
      </>
    ) : (
      <Stack gap={0.5} component='span'>
        {errorMessage && <span>{errorMessage}</span>}
        {showHelperText && <span>{helperTextElement}</span>}
      </Stack>
    );

    return [placeholder, helperTextNode];
  }, [errorMessage, globalFeatureFlags?.mciId, helperTextProp, showSearchTips]);

  return (
    <CommonSearchInput
      label={
        label && (
          <RequiredLabel text={label} TypographyProps={{ fontWeight: 600 }} />
        )
      }
      name='search client'
      placeholder={placeholder}
      helperText={helperText}
      {...props}
      InputProps={{
        ...props.InputProps,
        inputProps: {
          'data-testid': 'clientSearchInput',
          ...props.InputProps?.inputProps,
        },
      }}
    />
  );
};

export default ClientTextSearchInput;
