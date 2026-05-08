import { InputAdornment } from '@mui/material';
import { Box } from '@mui/system';
import React, { useMemo } from 'react';

import GenericSelect from '@/components/elements/input/GenericSelect';
import { PickListOption, WorkspaceFieldsFragment } from '@/types/gqlTypes';

const ALL_WORKSPACES_OPTION: PickListOption = {
  code: 'all',
  label: 'All Projects',
};

interface Props {
  selectedWorkspace?: WorkspaceFieldsFragment;
  workspaces: WorkspaceFieldsFragment[];
  onChange: (workspaceSlug: string | null) => void;
}

const WorkspaceSelect: React.FC<Props> = ({
  selectedWorkspace,
  workspaces,
  onChange,
}) => {
  const workspaceOptions = useMemo(
    () => [
      ALL_WORKSPACES_OPTION,
      ...workspaces.map((w) => ({
        code: w.slug,
        label: w.name,
      })),
    ],
    [workspaces]
  );
  const selectedWorkspaceOption =
    workspaceOptions.find((w) => w.code === selectedWorkspace?.slug) ||
    ALL_WORKSPACES_OPTION;

  return (
    <GenericSelect<PickListOption, false, false>
      size='small'
      label='Workspace'
      ariaLabel='Workspace'
      options={workspaceOptions}
      value={selectedWorkspaceOption}
      getOptionLabel={(option) => option.label || option.code}
      isOptionEqualToValue={(option, value) => option.code === value.code}
      blurOnSelect
      disableClearable
      onChange={(_event, value) => onChange(value?.code || null)}
      sx={{
        minWidth: 240,
        '& .MuiInputBase-input': { fontWeight: 600, color: 'primary.dark' },
      }}
      textInputProps={{
        InputProps: {
          startAdornment: (
            <InputAdornment
              position='start'
              aria-hidden='true'
              sx={{ ml: 1, mr: 0 }}
            >
              <Box
                component='span'
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                }}
              />
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default WorkspaceSelect;
