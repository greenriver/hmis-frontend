import PersonIcon from '@mui/icons-material/Person';
import { Box, Grid } from '@mui/material';
import React, { useCallback } from 'react';

import { useNavigate } from 'react-router-dom';
import ProjectClientEnrollmentsTable from './ProjectClientEnrollmentsTable';
import ProjectHouseholdsTable from './ProjectHouseholdsTable';

import CommonToggle from '@/components/elements/CommonToggle';
import LabelWithContent from '@/components/elements/LabelWithContent';
import { HouseholdIcon } from '@/components/elements/SemanticIcons';
import useDebouncedState from '@/hooks/useDebouncedState';
import ClientSearchInput from '@/modules/search/components/ClientTextSearchInput';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { generateSafePath } from '@/utils/pathEncoding';

export type ProjectEnrollmentsTableMode = 'clients' | 'households';

interface Props {
  mode: ProjectEnrollmentsTableMode;
  projectId: string;
}
const ProjectEnrollmentsTable: React.FC<Props> = ({ mode, projectId }) => {
  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');

  const navigate = useNavigate();
  const setMode = useCallback(
    (newMode: ProjectEnrollmentsTableMode) => {
      switch (newMode) {
        case 'households':
          navigate(
            generateSafePath(
              ProjectDashboardRoutes.PROJECT_ENROLLMENTS_HOUSEHOLDS,
              { projectId }
            )
          );
          break;
        case 'clients':
          navigate(
            generateSafePath(
              ProjectDashboardRoutes.PROJECT_ENROLLMENTS_CLIENTS,
              { projectId }
            )
          );
          break;
      }
    },
    [navigate, projectId]
  );

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
                        value: 'households',
                        label: 'Households',
                        Icon: HouseholdIcon,
                      },
                      {
                        value: 'clients',
                        label: 'Clients',
                        Icon: PersonIcon,
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
          setSearchTerm={setSearch}
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
