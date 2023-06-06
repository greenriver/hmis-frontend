import { Box, Grid, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { ReferralPostingStatusDisplay } from './ReferralPostingStatusDisplay';

import { CommonUntyledList } from '@/components/CommonUnstyledList';
import NotCollectedText from '@/modules/form/components/viewable/item/NotCollectedText';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { ReferralPostingDetailFieldsFragment } from '@/types/gqlTypes';

interface Props {
  referralPosting: ReferralPostingDetailFieldsFragment;
}
export const ProjectReferralPostingDetails: React.FC<Props> = ({
  referralPosting,
}) => {
  const col1: Array<[string, ReactNode]> = [
    [
      'Referral Status',
      <ReferralPostingStatusDisplay status={referralPosting.status} />,
    ],
    ['Referral Project Name', referralPosting.referredFrom],
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
            {list.map(([label, value]) => (
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
