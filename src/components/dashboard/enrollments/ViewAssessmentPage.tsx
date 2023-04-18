/* eslint-disable @typescript-eslint/no-unused-vars */
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { useOutletContext, Link as ReactRouterLink } from 'react-router-dom';

import Loading from '@/components/elements/Loading';
import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import { DashboardContext } from '@/components/pages/ClientDashboard';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import { useScrollToHash } from '@/hooks/useScrollToHash';
import AssessmentTitle from '@/modules/assessments/components/AssessmentTitle';
import { useAssessment } from '@/modules/assessments/components/useAssessment';
import FormStepper from '@/modules/form/components/FormStepper';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import { createInitialValuesFromSavedValues } from '@/modules/form/util/formUtil';
import IdDisplay from '@/modules/hmis/components/IdDisplay';
import { useHasClientPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { DashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import { EnrollmentFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const ViewAssessmentPage = ({
  top = STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT,
}: {
  top?: number;
}) => {
  const { client, enrollment } = useOutletContext<DashboardContext>();
  const { clientId, enrollmentId, assessmentId } = useSafeParams() as {
    clientId: string;
    enrollmentId: string;
    assessmentId: string;
  };

  const canEdit = useHasClientPermissions(clientId, [
    'canViewEnrollmentDetails',
  ]);

  const {
    definition,
    assessment,
    loading: dataLoading,
    assessmentTitle,
    formRole,
  } = useAssessment({
    enrollmentId,
    relationshipToHoH: (enrollment as EnrollmentFieldsFragment)
      .relationshipToHoH,
    client,
    assessmentId,
  });

  useScrollToHash(!assessment || dataLoading, top);

  if (dataLoading) return <Loading />;
  if (!definition || !assessment) return <NotFound />;

  const values = createInitialValuesFromSavedValues(
    definition.definition,
    assessment.customForm?.values
  );

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <AssessmentTitle
            assessmentTitle={assessmentTitle}
            actions={
              <>
                {canEdit && (
                  <Button
                    color='secondary'
                    variant='outlined'
                    startIcon={<EditIcon />}
                    component={ReactRouterLink}
                    to={generateSafePath(DashboardRoutes.EDIT_ASSESSMENT, {
                      enrollmentId,
                      assessmentId,
                      clientId,
                    })}
                  >
                    Edit
                  </Button>
                )}
              </>
            }
          />
        </Grid>
        <Grid item xs={2.5}>
          <Box
            sx={{
              position: 'sticky',
              top: top + 16,
            }}
          >
            <Paper sx={{ p: 2 }}>
              {formRole && (
                <Typography variant='h6' mb={2}>
                  {HmisEnums.FormRole[formRole]}
                </Typography>
              )}
              <FormStepper
                items={definition.definition.item}
                scrollOffset={top}
              />
            </Paper>
            {import.meta.env.MODE === 'development' && assessment && (
              <Box sx={{ py: 2, px: 1 }}>
                <IdDisplay prefix='Assessment' id={assessment.id} />
              </Box>
            )}
          </Box>
        </Grid>
        <Grid item xs={9.5}>
          <DynamicView
            values={values}
            definition={definition.definition}
            pickListRelationId={enrollment?.project?.id}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default ViewAssessmentPage;
