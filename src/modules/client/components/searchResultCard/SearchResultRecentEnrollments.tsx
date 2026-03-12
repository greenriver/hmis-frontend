import { Grid, Typography } from '@mui/material';
import { Fragment } from 'react';

import RouterLink from '@/components/elements/RouterLink';
import { entryExitRange } from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { GetClientEnrollmentsQuery } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const SearchResultRecentEnrollments = ({
  clientId,
  recentEnrollments,
}: {
  clientId: string;
  recentEnrollments: NonNullable<
    GetClientEnrollmentsQuery['client']
  >['enrollments']['nodes'];
}) => {
  return (
    <Grid container spacing={0.5}>
      {recentEnrollments.map((enrollment) => (
        <Fragment key={enrollment.id}>
          <Grid item xs={6} lg={4}>
            {enrollment.access.canViewEnrollmentDetails ? (
              <RouterLink
                aria-label={enrollment.projectName}
                to={generateSafePath(
                  EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
                  {
                    clientId,
                    enrollmentId: enrollment.id,
                  }
                )}
              >
                {enrollment.projectName}
              </RouterLink>
            ) : (
              enrollment.projectName
            )}
          </Grid>
          <Grid item xs={6}>
            <Typography variant='body2' sx={{ ml: 1, color: 'text.secondary' }}>
              {entryExitRange(enrollment)}
            </Typography>
          </Grid>
        </Fragment>
      ))}
    </Grid>
  );
};

export default SearchResultRecentEnrollments;
