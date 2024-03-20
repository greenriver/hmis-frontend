import PersonIcon from '@mui/icons-material/Person';
import { Box, Grid } from '@mui/material';
import { useState } from 'react';

import ProjectClientEnrollmentsTable, {
  EnrollmentFields,
} from './ProjectClientEnrollmentsTable';
import ProjectHouseholdsTable from './ProjectHouseholdsTable';

import CommonToggle from '@/components/elements/CommonToggle';
import LabelWithContent from '@/components/elements/LabelWithContent';
import { HouseholdIcon } from '@/components/elements/SemanticIcons';
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
  const [search, setSearch, debouncedSearch] = useDebouncedState<string>('');

  const [mode, setMode] = useState<Mode>(modeProp || initialModeProp);

  return (
    <>
      <Box py={2} px={3} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Grid container direction='row' rowSpacing={2} columnSpacing={4}>
          {!modeProp && (
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
          )}
          <Grid item flexGrow={1}>
            {searchable ? (
              <ClientSearchInput
                value={search || ''}
                onChange={setSearch}
                helperText={null}
              />
            ) : undefined}
          </Grid>
        </Grid>
      </Box>
      {mode === 'clients' && (
        <ProjectClientEnrollmentsTable
          columns={columns}
          linkRowToEnrollment={linkRowToEnrollment}
          searchTerm={debouncedSearch || undefined}
          projectId={projectId}
          openOnDate={openOnDate}
        />
      )}
      {mode === 'households' && (
        <ProjectHouseholdsTable
          searchTerm={debouncedSearch || undefined}
          projectId={projectId}
          openOnDate={openOnDate}
        />
      )}
    </>
  );
};
export default ProjectEnrollmentsTable;
