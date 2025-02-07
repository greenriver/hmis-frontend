import PersonIcon from '@mui/icons-material/Person';
import { Box, Grid } from '@mui/material';
import React, { useState } from 'react';

import ProjectClientEnrollmentsTable from './ProjectClientEnrollmentsTable';
import ProjectHouseholdsTable from './ProjectHouseholdsTable';

import CommonToggle from '@/components/elements/CommonToggle';
import LabelWithContent from '@/components/elements/LabelWithContent';
import { HouseholdIcon } from '@/components/elements/SemanticIcons';
import useDebouncedState from '@/hooks/useDebouncedState';
import ClientSearchInput from '@/modules/search/components/ClientTextSearchInput';

type Mode = 'clients' | 'households';

interface Props {
  projectId: string;
}
const ProjectEnrollmentsTable: React.FC<Props> = ({ projectId }) => {
  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');

  const [mode, setMode] = useState<Mode>('clients');

  return (
    <>
      <Box py={2} px={3} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Grid container direction='row' rowSpacing={2} columnSpacing={4}>
          {
            <Grid item>
              <LabelWithContent
                label='View enrollments by'
                labelId='results-display-format-label'
                renderChildren={(labelElement) => (
                  <CommonToggle
                    value={mode}
                    onChange={setMode}
                    variant='gray'
                    size='small'
                    aria-labelledby={
                      (labelElement && labelElement.getAttribute('id')) ||
                      undefined
                    }
                    sx={{
                      '.MuiToggleButton-root': { fontWeight: 600 },
                      '.MuiButtonBase-root.Mui-selected, .MuiButtonBase-root.Mui-selected:hover':
                        {
                          backgroundColor: (theme) =>
                            theme.palette.primary.main,
                          color: (theme) => theme.palette.primary.contrastText,
                        },
                    }}
                    items={[
                      {
                        value: 'clients',
                        label: 'Clients',
                        Icon: PersonIcon,
                      },
                      {
                        value: 'households',
                        label: 'Households',
                        Icon: HouseholdIcon,
                      },
                    ]}
                  />
                )}
              />
            </Grid>
          }
          <Grid item flexGrow={1}>
            <ClientSearchInput
              value={search || ''}
              onChange={setSearch}
              helperText={null}
            />
          </Grid>
        </Grid>
      </Box>
      {mode === 'clients' && (
        <ProjectClientEnrollmentsTable
          searchTerm={debouncedSearch || undefined}
          projectId={projectId}
        />
      )}
      {mode === 'households' && (
        <ProjectHouseholdsTable
          searchTerm={debouncedSearch || undefined}
          projectId={projectId}
        />
      )}
    </>
  );
};
export default ProjectEnrollmentsTable;
