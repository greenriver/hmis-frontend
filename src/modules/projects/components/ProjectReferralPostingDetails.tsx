import { Grid, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { ReferralPostingStatusDisplay } from './ReferralPostingStatusDisplay';

import { CommonUntyledList } from '@/components/CommonUnstyledList';
import NotCollectedText from '@/modules/form/components/viewable/item/NotCollectedText';
import { HmisEnums } from '@/types/gqlEnums';
import { ReferralPostingDetailFieldsFragment } from '@/types/gqlTypes';

interface Props {
  referralPosting: ReferralPostingDetailFieldsFragment;
}
export const ProjectReferralPostingDetails: React.FC<Props> = ({
  referralPosting,
}) => {
  const bedType = referralPosting?.unitType?.bedType;
  const col1: Array<[string, ReactNode]> = [
    [
      'Referral Status',
      <ReferralPostingStatusDisplay status={referralPosting.status} />,
    ],
    ['Referral Project Name', referralPosting.referredFrom],
    ['Referral Date', referralPosting.referralDate],
    ['Referred By', referralPosting.referredBy],
    ['Score', referralPosting.score],
  ];
  const col2: Array<[string, ReactNode]> = [
    ['Referral ID', referralPosting.referralIdentifier],
    ['Unit Type', bedType ? HmisEnums.InventoryBedType[bedType] : ''],
    ['Chronically Homeless', referralPosting.chronic],
    [
      'Needs Wheelchair Accessible Unit',
      referralPosting.needsWheelchairAccessibleUnit,
    ],
  ];
  return (
    <Grid container columnSpacing={6}>
      {[col1, col2].map((list) => (
        <Grid item key={list[0][0]}>
          <Stack spacing={2} component={CommonUntyledList} sx={{ columns: 2 }}>
            {list.map(([label, value]) => (
              <li key={label}>
                <Typography
                  sx={({ typography }) => ({
                    fontWeight: typography.fontWeightBold,
                  })}
                >
                  {label}
                </Typography>
                {value || <NotCollectedText />}
              </li>
            ))}
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
};
