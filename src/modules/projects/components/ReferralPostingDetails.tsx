import { Box, Grid, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { CommonUnstyledList } from '@/components/CommonUnstyledList';
import NotCollectedText from '@/components/elements/NotCollectedText';
import RouterLink from '@/components/elements/RouterLink';
import YesNoDisplay from '@/components/elements/YesNoDisplay';
import { hasMeaningfulValue } from '@/modules/form/util/formUtil';
import {
  parseAndFormatDate,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import ReferralPostingStatusDisplay from '@/modules/referrals/components/ReferralPostingStatusDisplay';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { ReferralPostingDetailFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

interface Props {
  referralPosting: ReferralPostingDetailFieldsFragment;
}
const ProjectReferralPostingDetails: React.FC<Props> = ({
  referralPosting,
}) => {
  const col1: Array<[string, ReactNode]> = [
    [
      'Referral Status',
      <ReferralPostingStatusDisplay
        status={referralPosting.status}
        sx={{ mt: 0.5 }}
      />,
    ],
    [
      'Enrollment',
      referralPosting.hohEnrollment ? (
        <RouterLink
          to={generateSafePath(EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW, {
            clientId: referralPosting.hohEnrollment.client.id,
            enrollmentId: referralPosting.hohEnrollment.id,
          })}
          openInNew
        >
          View Enrollment
        </RouterLink>
      ) : undefined,
    ],
    ['Referral Date', parseAndFormatDate(referralPosting.referralDate)],
    ['Referred From', referralPosting.referredFrom],
    ['Referred By', referralPosting.referredBy],
    ['Assigned At', parseAndFormatDateTime(referralPosting.assignedDate)],
  ];
  const col2: Array<[string, ReactNode]> = [
    ['Referral ID', referralPosting.referralIdentifier],
    ['Unit Type', referralPosting?.unitType?.description],
    ['Score', referralPosting.score],
    [
      'Chronically Homeless',
      <YesNoDisplay
        booleanValue={referralPosting.chronic}
        fallback={<NotCollectedText variant='body2' />}
      />,
    ],
    [
      'HUD Chronically Homeless' as string,
      referralPosting.hohEnrollment?.client.hudChronic !== null ? (
        <YesNoDisplay
          booleanValue={referralPosting.hohEnrollment?.client.hudChronic}
          fallback={<NotCollectedText variant='body2' />}
        />
      ) : (
        (undefined as ReactNode)
      ),
    ] as const,
    [
      'Needs Wheelchair Accessible Unit',
      <YesNoDisplay
        booleanValue={referralPosting.needsWheelchairAccessibleUnit}
        fallback={<NotCollectedText variant='body2' />}
      />,
    ],
  ].filter((ary): ary is [string, ReactNode] => !!ary[1]);
  return (
    <Grid container columnSpacing={6} rowSpacing={2}>
      {[col1, col2].map((list) => (
        <Grid item key={list[0][0]}>
          <Stack spacing={2} component={CommonUnstyledList} sx={{ columns: 2 }}>
            {list
              .filter((labelValue) => hasMeaningfulValue(labelValue[1]))
              .map(([label, value]) => (
                <Typography component='li' key={label} variant='body2'>
                  <Box
                    sx={({ typography }) => ({
                      fontWeight: typography.fontWeightBold,
                    })}
                  >
                    {label}
                  </Box>
                  {hasMeaningfulValue(value) ? (
                    value
                  ) : (
                    <NotCollectedText variant='body2' />
                  )}
                </Typography>
              ))}
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProjectReferralPostingDetails;
