import React, { useMemo } from 'react';
import RequiredLabel from '@/modules/form/components/RequiredLabel';
import { useHmisAppSettings } from '@/modules/hmisAppSettings/useHmisAppSettings';
import CommonSearchInput, {
  CommonSearchInputProps,
} from '@/modules/search/components/CommonSearchInput';

export interface ClientTextSearchInputProps extends CommonSearchInputProps {
  errorMessage?: string;
  label?: string | null;
}

// NOTE: we should use translations for variations (like adding MCI ID) but its not set up yet for multiple envs

const defaultSearchClientsPlaceholder =
  'Search by name, DOB, SSN, or Personal ID';

const getDefaultPlaceholder = (mciEnabled: boolean) => {
  return mciEnabled
    ? defaultSearchClientsPlaceholder.replace(
        'or Personal ID',
        'Personal ID, or MCI ID'
      )
    : defaultSearchClientsPlaceholder;
};

const ClientTextSearchInput: React.FC<ClientTextSearchInputProps> = ({
  errorMessage,
  label = 'Search Clients',
  ...props
}) => {
  const { globalFeatureFlags } = useHmisAppSettings();

  const [placeholder, helperText] = useMemo(() => {
    const placeholder = getDefaultPlaceholder(!!globalFeatureFlags?.mciId);
    return [placeholder, errorMessage];
  }, [errorMessage, globalFeatureFlags?.mciId]);

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
