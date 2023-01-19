import { Alert, Box, Stack, Typography } from '@mui/material';
import * as Sentry from '@sentry/react';
import { useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';

import Assessment from './Assessment';
import { useAssessment } from './useAssessment';

import { alertErrorFallback } from '@/components/elements/ErrorFallback';
import Loading from '@/components/elements/Loading';
import { CONTEXT_HEADER_HEIGHT } from '@/components/layout/dashboard/contextHeader/ContextHeader';
import { STICKY_BAR_HEIGHT } from '@/components/layout/MainLayout';
import { DashboardContext } from '@/components/pages/ClientDashboard';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import { AssessmentRole } from '@/types/gqlTypes';

const MissingDefinitionAlert = () => (
  <Alert severity='error'>
    <Stack direction={'row'} spacing={0.5}>
      <span>Unable to load form. </span>
      {import.meta.env.MODE === 'development' && (
        <>
          <span>Did you run</span>
          <Typography variant='body2' sx={{ fontFamily: 'Monospace' }}>
            rails driver:hmis:seed_definitions
          </Typography>
          <span>?</span>
        </>
      )}
    </Stack>
  </Alert>
);

const AssessmentPage = () => {
  const { enrollment, overrideBreadcrumbTitles } =
    useOutletContext<DashboardContext>();

  const {
    definition,
    assessment,
    loading: dataLoading,
    assessmentTitle,
    assessmentRole,
  } = useAssessment();

  const informationDate = useMemo(() => {
    if (!enrollment) return;
    switch (assessmentRole) {
      case AssessmentRole.Intake:
        return enrollment.entryDate;
      case AssessmentRole.Exit:
        return enrollment.exitDate;
      default:
        return;
    }
  }, [enrollment, assessmentRole]);

  useEffect(() => {
    if (!assessmentTitle) return;
    // Override breadcrumb to include the assessment type and information date
    const route = assessment
      ? DashboardRoutes.VIEW_ASSESSMENT
      : DashboardRoutes.NEW_ASSESSMENT;
    const breadCrumbTitle = `${assessmentTitle} ${
      informationDate ? `for ${parseAndFormatDate(informationDate)}` : ''
    }`;
    overrideBreadcrumbTitles({ [route]: breadCrumbTitle });
  }, [assessmentTitle, informationDate, assessment, overrideBreadcrumbTitles]);

  useScrollToHash(
    !enrollment || dataLoading,
    STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT
  );

  if (dataLoading) return <Loading />;
  if (!enrollment) throw Error('Enrollment not found');

  return (
    <>
      <Box
        sx={{
          backgroundColor: (theme) => theme.palette.background.default,
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Stack direction='row'>
          <Typography variant='h4' sx={{ mb: 2, fontWeight: 400 }}>
            <b>{assessmentTitle}</b>
            {informationDate && ` ${parseAndFormatDate(informationDate)}`}
          </Typography>
        </Stack>
      </Box>
      {!definition && <MissingDefinitionAlert />}
      {definition && (
        <Assessment
          assessmentRole={assessmentRole}
          definition={definition}
          assessment={assessment}
        />
      )}
    </>
  );
};

const WrappedAssessment = () => (
  <Box>
    <Sentry.ErrorBoundary fallback={alertErrorFallback}>
      <AssessmentPage />
    </Sentry.ErrorBoundary>
  </Box>
);

export default WrappedAssessment;
