import DescriptionIcon from '@mui/icons-material/Description';
import { Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import IconButtonContainer from './IconButtonContainer';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { DashboardEnrollment } from '@/modules/hmis/types';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { AssessmentRole } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  enrollment: DashboardEnrollment;
}

const EntryExitDatesWithAssessmentLinks: React.FC<Props> = ({ enrollment }) => {
  const navigate = useNavigate();
  const intakePath = useMemo(
    () =>
      enrollment.intakeAssessment
        ? generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
            clientId: enrollment.client.id,
            enrollmentId: enrollment.id,
            formRole: AssessmentRole.Intake,
            assessmentId: enrollment.intakeAssessment.id,
          })
        : generateSafePath(EnrollmentDashboardRoutes.NEW_ASSESSMENT, {
            clientId: enrollment.client.id,
            enrollmentId: enrollment.id,
            formRole: AssessmentRole.Intake,
          }),
    [enrollment]
  );
  const exitPath = useMemo(
    () =>
      enrollment.exitAssessment
        ? generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
            clientId: enrollment.client.id,
            enrollmentId: enrollment.id,
            formRole: AssessmentRole.Exit,
            assessmentId: enrollment.exitAssessment.id,
          })
        : generateSafePath(EnrollmentDashboardRoutes.NEW_ASSESSMENT, {
            clientId: enrollment.client.id,
            enrollmentId: enrollment.id,
            formRole: AssessmentRole.Exit,
          }),
    [enrollment]
  );

  const canLinkToIntake =
    enrollment.access.canEditEnrollments || !enrollment.inProgress;

  return (
    <Stack direction='row' alignItems='center' gap={2}>
      <Box component='span'>
        {canLinkToIntake ? (
          <IconButtonContainer
            Icon={DescriptionIcon}
            onClick={() => navigate(intakePath)}
            tooltip='Go to Intake Assessment'
          >
            {parseAndFormatDate(enrollment.entryDate)}
          </IconButtonContainer>
        ) : (
          parseAndFormatDate(enrollment.entryDate)
        )}
      </Box>
      <Box component='span'>&ndash;</Box>
      <Box component='span'>
        <IconButtonContainer
          Icon={DescriptionIcon}
          onClick={() => navigate(exitPath)}
          tooltip='Go to Exit Assessment'
        >
          {enrollment.exitDate ? (
            parseAndFormatDate(enrollment.exitDate)
          ) : (
            <Typography
              component='span'
              variant='body2'
              color='success.main'
              fontWeight={600}
            >
              Active
            </Typography>
          )}
        </IconButtonContainer>
      </Box>
    </Stack>
  );
};

export default EntryExitDatesWithAssessmentLinks;
