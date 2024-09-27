import { Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { useMemo } from 'react';
import { EnrollmentDashboardRoutes } from '@/app/routes';
import ButtonLink from '@/components/elements/ButtonLink';
import ButtonTooltipContainer from '@/components/elements/ButtonTooltipContainer';
import { AssessmentIcon } from '@/components/elements/SemanticIcons';
import theme from '@/config/theme';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { DashboardEnrollment } from '@/modules/hmis/types';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  enrollment: DashboardEnrollment;
}

const EntryExitDatesWithAssessmentLinks: React.FC<Props> = ({ enrollment }) => {
  const intakePath = useMemo(
    () =>
      generateSafePath(EnrollmentDashboardRoutes.INTAKE, {
        clientId: enrollment.client.id,
        enrollmentId: enrollment.id,
      }),

    [enrollment]
  );
  const exitPath = useMemo(
    () =>
      generateSafePath(EnrollmentDashboardRoutes.EXIT, {
        clientId: enrollment.client.id,
        enrollmentId: enrollment.id,
      }),
    [enrollment]
  );

  const canLinkToIntake =
    enrollment.access.canEditEnrollments || !enrollment.inProgress;

  const exitDateOrActive = enrollment.exitDate ? (
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
  );

  return (
    <Stack direction='row' alignItems='center' gap={2}>
      <Box component='span'>
        {canLinkToIntake ? (
          <Stack direction='row' alignItems='center'>
            <span>{parseAndFormatDate(enrollment.entryDate)}</span>
            <ButtonTooltipContainer title='Go to Intake Assessment'>
              <ButtonLink
                to={intakePath}
                variant='text'
                sx={{ minWidth: '30px', color: theme.palette.links }}
              >
                <AssessmentIcon fontSize='small' />
              </ButtonLink>
            </ButtonTooltipContainer>
          </Stack>
        ) : (
          parseAndFormatDate(enrollment.entryDate)
        )}
      </Box>
      <Box component='span'>&ndash;</Box>
      <Box component='span'>
        <Stack direction='row' alignItems='center'>
          <span>{exitDateOrActive}</span>
          <ButtonTooltipContainer title='Go to Exit Assessment'>
            <ButtonLink
              to={exitPath}
              variant='text'
              sx={{ minWidth: '30px', color: theme.palette.links }}
            >
              <AssessmentIcon fontSize='small' />
            </ButtonLink>
          </ButtonTooltipContainer>
        </Stack>
      </Box>
    </Stack>
  );
};

export default EntryExitDatesWithAssessmentLinks;
