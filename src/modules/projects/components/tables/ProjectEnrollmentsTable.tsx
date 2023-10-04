import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import { Box, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useCallback, useState } from 'react';

import ProjectClientEnrollmentsTable, {
  EnrollmentFields,
} from './ProjectClientEnrollmentsTable';
import ProjectHouseholdsTable from './ProjectHouseholdsTable';

import LabelWithContent from '@/components/elements/LabelWithContent';
import { ColumnDef } from '@/components/elements/table/types';
import useDebouncedState from '@/hooks/useDebouncedState';
import ClientSearchInput from '@/modules/search/components/ClientTextSearchInput';

type Mode = 'clients' | 'households';

const ProjectEnrollmentsTable = ({
  projectId,
  columns,
  openOnDate,
  linkRowToEnrollment = false,
  searchable = true,
  mode: modeProp,
  initialMode: initialModeProp = 'households',
}: {
  mode?: Mode;
  initialMode?: Mode;
  projectId: string;
  columns?: ColumnDef<EnrollmentFields>[];
  linkRowToEnrollment?: boolean;
  openOnDate?: Date;
  searchable?: boolean;
}) => {
  const [search, setSearch, debouncedSearch] = useDebouncedState<
    string | undefined
  >(undefined);

  const [mode, setMode] = useState<Mode>(modeProp || initialModeProp);

  const onChangeMode = useCallback(
    (event: React.MouseEvent<HTMLElement>, value: Mode) =>
      value && setMode(value),
    []
  );

  return (
    <>
      <Box py={2} px={3} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction='row' gap={4}>
          {!modeProp && (
            <Box>
              <LabelWithContent
                label='View enrollments by'
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
                      sx={{ px: 2 }}
                    >
                      <PeopleIcon fontSize='small' />
                      <Box sx={{ pl: 0.5 }}>Households</Box>
                    </ToggleButton>
                    <ToggleButton
                      value='clients'
                      aria-label='Clients'
                      size='small'
                      sx={{ px: 2 }}
                    >
                      <PersonIcon fontSize='small' />
                      <Box sx={{ pl: 0.5 }}>Clients</Box>
                    </ToggleButton>
                  </ToggleButtonGroup>
                )}
              />
            </Box>
          )}
          <Box flexGrow={1}>
            {searchable ? (
              <ClientSearchInput
                value={search || ''}
                onChange={(e) => setSearch(e.target.value)}
                helperText={null}
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
