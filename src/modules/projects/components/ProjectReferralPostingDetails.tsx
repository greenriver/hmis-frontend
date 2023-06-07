import { Box, Grid, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { ReferralPostingStatusDisplay } from './ReferralPostingStatusDisplay';

import { CommonUntyledList } from '@/components/CommonUnstyledList';
import RouterLink from '@/components/elements/RouterLink';
import NotCollectedText from '@/modules/form/components/viewable/item/NotCollectedText';
import { hasMeaningfulValue } from '@/modules/form/util/formUtil';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { ClientDashboardRoutes } from '@/routes/routes';
import { ReferralPostingDetailFieldsFragment } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

interface Props {
  referralPosting: ReferralPostingDetailFieldsFragment;
}
export const ProjectReferralPostingDetails: React.FC<Props> = ({
  referralPosting,
}) => {
  const col1: Array<[string, ReactNode]> = [
    [
      'Referral Status',
      <ReferralPostingStatusDisplay
        status={referralPosting.status}
        size='small'
        variant='filled'
        color='secondary'
        sx={{ mt: 0.5 }}
      />,
    ],
    [
      'Enrollment',
      referralPosting.hohEnrollment ? (
        <RouterLink
          to={generateSafePath(ClientDashboardRoutes.VIEW_ENROLLMENT, {
            clientId: referralPosting.hohEnrollment.client.id,
            enrollmentId: referralPosting.hohEnrollment.id,
          })}
          openInNew
        >
          View Enrollment
        </RouterLink>
      ) : undefined,
    ],
    ['Project Name', referralPosting.referredFrom],
    ['Referral Date', parseAndFormatDate(referralPosting.referralDate)],
    ['Referred By', referralPosting.referredBy],
    ['Score', referralPosting.score],
  ];
  const col2: Array<[string, ReactNode]> = [
    ['Referral ID', referralPosting.referralIdentifier],
    ['Unit Type', referralPosting?.unitType?.description],
    ['Chronically Homeless', referralPosting.chronic],
    [
      'Needs Wheelchair Accessible Unit',
      referralPosting.needsWheelchairAccessibleUnit,
    ],
  ];
  return (
    <Grid container columnSpacing={6} rowSpacing={2}>
      {[col1, col2].map((list) => (
        <Grid item key={list[0][0]}>
          <Stack spacing={2} component={CommonUntyledList} sx={{ columns: 2 }}>
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
                  {value || <NotCollectedText variant='body2' />}
                </Typography>
              ))}
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
};
