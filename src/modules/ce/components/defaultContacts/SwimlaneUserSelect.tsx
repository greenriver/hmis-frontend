import { Stack } from '@mui/material';
import React, { useMemo } from 'react';
import { ErrorIcon } from '@/components/elements/SemanticIcons';
import SwimlaneLabel from '@/modules/ce/components/defaultContacts/SwimlaneLabel';
import FormSelect from '@/modules/form/components/FormSelect';
import {
  CeSwimlaneFieldsFragment,
  GetPickListQueryVariables,
  PickListOption,
  useGetPickListQuery,
} from '@/types/gqlTypes';

interface Props {
  value: PickListOption[];
  onChange: (value: PickListOption[]) => void;
  warnIfEmpty: boolean;
  pickListArgs: GetPickListQueryVariables;
  swimlane: CeSwimlaneFieldsFragment;
}

const SwimlaneUserSelect: React.FC<Props> = ({
  value,
  onChange,
  warnIfEmpty,
  pickListArgs,
  swimlane,
}) => {
  const {
    data: { pickList: usersPickList } = {},
    loading: usersLoading,
    error: usersError,
  } = useGetPickListQuery({
    variables: pickListArgs,
  });

  const fixedOptions = useMemo(() => {
    // If an option is selected (in the value array) and disabled,
    // it should appear fixed and not be allowed to be deselected.
    // This is used for global default contacts that are displayed at the project level, but not interactable.
    return value.filter((option) => option.disabled);
  }, [value]);

  if (usersError) throw usersError;

  const isEmpty = !value?.length;
  const showMissingWarning = isEmpty && warnIfEmpty;

  const anyUserInactive =
    value?.some((user) => user.label?.includes('(Inactive)')) || false;

  const label = (
    <Stack direction='row' spacing={1} alignItems='center'>
      <SwimlaneLabel swimlane={swimlane} showTooltip={false} />
      {showMissingWarning && (
        <Stack direction='row' spacing={0.5} alignItems='center'>
          <ErrorIcon sx={{ fontSize: 'inherit', color: 'warning.main' }} />
          <span>Missing</span>
        </Stack>
      )}
    </Stack>
  );

  return (
    <FormSelect
      label={label}
      value={value || []}
      options={usersPickList || []}
      onChange={(_, value) => onChange(value)}
      fixedOptions={fixedOptions}
      multiple
      placeholder='Select'
      helperText={`Tasks: ${swimlane.taskNames.join(', ')}`}
      color={showMissingWarning || anyUserInactive ? 'warning' : undefined}
      loading={usersLoading}
    />
  );
};

export default SwimlaneUserSelect;
