import AddIcon from '@mui/icons-material/Add';
import { Grid, Paper, Stack } from '@mui/material';

import { Box } from '@mui/system';
import { useCallback, useMemo, useState } from 'react';
import { useProjectDashboardContext } from '../../projects/components/ProjectDashboard';
import { useBedNightsOnDate } from '../hooks/useBedNightsOnDate';
import AssignBedNightButton from './AssignBedNightButton';
import BedNightBulkActionButtons from './BedNightBulkActionButtons';
import ProjectEnrollmentsTableForBedNights, {
  EnrollmentFields,
} from './ProjectEnrollmentsTableForBedNights';
import ButtonLink from '@/components/elements/ButtonLink';
import { CommonCard } from '@/components/elements/CommonCard';
import DatePicker from '@/components/elements/input/DatePicker';
import PageTitle from '@/components/layout/PageTitle';
import useSafeParams from '@/hooks/useSafeParams';
import RequiredLabel from '@/modules/form/components/RequiredLabel';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { ClientTextSearchInputForm } from '@/modules/search/components/ClientTextSearchInput';
import { ProjectDashboardRoutes } from '@/routes/routes';
import generateSafePath from '@/utils/generateSafePath';

const ProjectBedNights = () => {
  const { project } = useProjectDashboardContext();
  const { projectId } = useSafeParams() as {
    projectId: string;
  };
  const [date, setDate] = useState<Date | null>(new Date());

  const [searchTerm, setSearchTerm] = useState<string | undefined>();

  // do initial fetch so its cached for buttons
  const { enrollmentIdsWithBedNights } = useBedNightsOnDate(projectId, date);

  const canEdit = project.access.canEditEnrollments;
  // NEW_SORT:
  // incomplete enrollments first (just got added), then last bed night
  // no bed nights ever (just got added), then last bed night

  const additionalColumns = useMemo(() => {
    return [
      {
        header: 'Bed Status',
        key: 'bed-status-action',
        dontLink: true,
        render: (e: EnrollmentFields) => {
          if (!date) return null;

          return (
            <AssignBedNightButton
              enrollmentId={e.id}
              bedNightDate={date}
              editable={canEdit}
              projectId={projectId}
            />
          );
        },
      },
    ];
  }, [date, canEdit, projectId]);

  const renderBulkAction = useCallback(
    (selectedEnrollmentIds: readonly string[]) => {
      if (!enrollmentIdsWithBedNights || !date) return <></>;
      return (
        <BedNightBulkActionButtons
          selectedEnrollmentIds={selectedEnrollmentIds as string[]}
          bedNightDate={date}
          projectId={projectId}
        />
      );
    },
    [enrollmentIdsWithBedNights, date, projectId]
  );

  return (
    <>
      <PageTitle
        title='Bed Night Management'
        actions={
          <ProjectPermissionsFilter
            id={projectId}
            permissions='canEnrollClients'
          >
            <ButtonLink
              data-testid='addHouseholdButton'
              variant='outlined'
              sx={{ pl: 3, justifyContent: 'left' }}
              to={generateSafePath(
                ProjectDashboardRoutes.PROJECT_BED_NIGHTS_NEW_ENROLLMENT,
                {
                  projectId,
                }
              )}
              Icon={AddIcon}
            >
              Enroll Client
            </ButtonLink>
          </ProjectPermissionsFilter>
        }
      />
      <Stack gap={4}>
        <CommonCard>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DatePicker
                label={
                  <RequiredLabel
                    text='Bed Night Date'
                    TypographyProps={{
                      fontWeight: 600,
                    }}
                  />
                }
                value={date}
                disableFuture
                sx={{ width: 200 }}
                onChange={setDate}
                textInputProps={{ id: 'bed-night-date' }}
              />
            </Grid>
            <Grid item xs={12} lg={10} xl={8}>
              <Box flexGrow={1} sx={{ mb: 1 }}>
                <ClientTextSearchInputForm
                  onSearch={(value) => setSearchTerm(value)}
                />
              </Box>
            </Grid>
          </Grid>
        </CommonCard>
        <Paper>
          <ProjectEnrollmentsTableForBedNights
            key={date?.toString() || 'init'}
            projectId={projectId}
            editable={canEdit}
            searchTerm={searchTerm}
            openOnDate={date || new Date()}
            additionalColumns={additionalColumns}
            renderBulkAction={canEdit ? renderBulkAction : undefined}
          />
        </Paper>
      </Stack>
    </>
  );
};
export default ProjectBedNights;
