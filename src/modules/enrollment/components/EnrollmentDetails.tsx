import { Box, Grid, Typography } from '@mui/material';
import { ReactNode, useMemo } from 'react';

import EnrollmentSummaryCount from './EnrollmentSummaryCount';
import EntryExitDatesWithAssessmentLinks from './EntryExitDatesWithAssessmentLinks';
import OccurrencePointValue, {
  parseOccurrencePointFormDefinition,
} from './OccurrencePointValue';
import Loading from '@/components/elements/Loading';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { occurrencePointCollectedForEnrollment } from '@/modules/hmis/hmisUtil';
import { DashboardEnrollment } from '@/modules/hmis/types';
import { HmisEnums } from '@/types/gqlEnums';
import { Destination } from '@/types/gqlTypes';

const EnrollmentDetails = ({
  enrollment,
}: {
  enrollment: DashboardEnrollment;
}) => {
  const rows = useMemo(() => {
    const content: Record<string, ReactNode> = {};
    // If enrollment is incomplete, show that first
    if (enrollment.inProgress) {
      content['Enrollment Status'] = (
        <EnrollmentStatus enrollment={enrollment} />
      );
    }

    // Entry - Exit date, with assmt links to change them
    content['Entry / Exit Dates'] = (
      <EntryExitDatesWithAssessmentLinks enrollment={enrollment} />
    );

    // Exit Destination
    if (enrollment.exitDate) {
      content['Exit Destination'] = (
        <HmisEnum
          value={enrollment.exitDestination || Destination.DataNotCollected}
          enumMap={HmisEnums.Destination}
        />
      );
    }

    // Summary of open enrollments. Arr will be empty unless user has access to see summaries.
    if (enrollment && enrollment.openEnrollmentSummary.length > 0) {
      const title = 'Other Open Enrollments';
      content[title] = (
        <EnrollmentSummaryCount
          enrollmentSummary={enrollment.openEnrollmentSummary}
          clientId={enrollment.client.id}
        />
      );
    }

    // Occurrence point values (move in date, date of engagement, etc.)
    enrollment.project.occurrencePointForms
      .filter((form) => occurrencePointCollectedForEnrollment(form, enrollment))
      .forEach(({ definition }) => {
        const { displayTitle, isEditable, readOnlyDefinition } =
          parseOccurrencePointFormDefinition(definition);

        content[displayTitle] = (
          <OccurrencePointValue
            enrollment={enrollment}
            definition={definition}
            readOnlyDefinition={readOnlyDefinition}
            editable={isEditable && enrollment.access.canEditEnrollments}
            dialogTitle={displayTitle}
          />
        );
      });

    return Object.entries(content).map(([id, value], index) => ({
      id: String(index),
      label: id,
      value,
    }));
  }, [enrollment]);

  if (!enrollment || !rows) return <Loading />;

  const itemSx = {
    py: 1.5,
    px: 2,
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <Box>
      <Grid
        container
        rowGap={0}
        sx={{
          '> .MuiGrid-item': {
            borderBottomColor: 'borders.light',
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
          },
          '> .MuiGrid-item:nth-last-of-type(2)': {
            border: 'unset',
          },
          '> .MuiGrid-item:nth-last-of-type(1)': {
            border: 'unset',
          },
        }}
      >
        {rows.map(({ id, label, value }) => (
          <>
            <Grid
              item
              xs={12}
              md={4}
              lg={5}
              sx={{ ...itemSx }}
              key={id + 'label'}
            >
              <Typography fontWeight={600} variant='body2'>
                {label}
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              md={8}
              lg={7}
              sx={{ ...itemSx }}
              key={id + 'value'}
            >
              <Typography
                variant='body2'
                component='div'
                sx={{ width: '100%' }}
              >
                {value}
              </Typography>
            </Grid>
          </>
        ))}
      </Grid>
    </Box>
  );
};

export default EnrollmentDetails;
