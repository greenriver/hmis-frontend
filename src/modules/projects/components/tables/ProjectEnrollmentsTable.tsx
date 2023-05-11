import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import { Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useCallback, useState } from 'react';

import ProjectClientEnrollmentsTable, {
  EnrollmentFields,
} from './ProjectClientEnrollmentsTable';
import ProjectHouseholdsTable from './ProjectHouseholdsTable';

import { ColumnDef } from '@/components/elements/GenericTable';
import TextInput from '@/components/elements/input/TextInput';
import LabelWithContent from '@/components/elements/LabelWithContent';
import useDebouncedState from '@/hooks/useDebouncedState';

type Mode = 'clients' | 'households';

const ProjectEnrollmentsTable = ({
  projectId,
  columns,
  openOnDate,
  linkRowToEnrollment = false,
  searchable = true,
  mode: modeProp,
  // TODO: implement, needs a backend flag
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  wipEnrollmentsOnly = false,
}: {
  mode?: Mode;
  projectId: string;
  columns?: ColumnDef<EnrollmentFields>[];
  linkRowToEnrollment?: boolean;
  openOnDate?: Date;
  searchable?: boolean;
  wipEnrollmentsOnly?: boolean;
}) => {
  const [search, setSearch, debouncedSearch] = useDebouncedState<
    string | undefined
  >(undefined);

  const [mode, setMode] = useState<Mode>(modeProp || 'clients');

  const onChangeMode = useCallback(
    (event: React.MouseEvent<HTMLElement>, value: Mode) =>
      value && setMode(value),
    []
  );

  return (
    <>
      <Box p={2}>
        <Stack direction='row' gap={2}>
          {!modeProp && (
            <Box>
              <LabelWithContent
                label='View Results as'
                labelId='results-display-format-label'
                renderChildren={(labelElement) => (
                  <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={onChangeMode}
                    aria-label='view enrollments by'
                    aria-labelledby={
                      (labelElement && labelElement.getAttribute('id')) ||
                      undefined
                    }
                  >
                    <ToggleButton
                      value='households'
                      aria-label='Enrollments'
                      size='small'
                    >
                      <PeopleIcon />
                      <Box sx={{ pl: 0.5 }}>Households</Box>
                    </ToggleButton>
                    <ToggleButton
                      value='clients'
                      aria-label='Clients'
                      size='small'
                    >
                      <PersonIcon />
                      <Box sx={{ pl: 0.5 }}>Clients</Box>
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}
              />
            </Box>
          )}
          <Box flexGrow={1}>
            {searchable ? (
              <TextInput
                label='Search Clients'
                name='search client'
                placeholder='Search clients...'
                value={search || ''}
                onChange={(e) => setSearch(e.target.value)}
              />
            ) : undefined}
          </Box>
        </Stack>
      </Box>
      {mode === 'clients' && (
        <ProjectClientEnrollmentsTable
          columns={columns}
          linkRowToEnrollment={linkRowToEnrollment}
          searchTerm={debouncedSearch}
          projectId={projectId}
          openOnDate={openOnDate}
        />
      )}
      {mode === 'households' && (
        <ProjectHouseholdsTable
          searchTerm={debouncedSearch}
          projectId={projectId}
          openOnDate={openOnDate}
        />
      )}
    </>
  );
};
export default ProjectEnrollmentsTable;
