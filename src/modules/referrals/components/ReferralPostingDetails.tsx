import { Box, Grid, Stack, Typography } from '@mui/material';
import { ReactNode, useMemo } from 'react';

import { CommonUnstyledList } from '@/components/CommonUnstyledList';
import NotCollectedText from '@/components/elements/NotCollectedText';
import RouterLink from '@/components/elements/RouterLink';
import YesNoDisplay from '@/components/elements/YesNoDisplay';
import { hasMeaningfulValue } from '@/modules/form/util/formUtil';
import {
  customDataElementValueAsString,
  parseAndFormatDate,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import ReferralPostingStatusDisplay from '@/modules/referrals/components/ReferralPostingStatusDisplay';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { ReferralPostingDetailFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  referralPosting: ReferralPostingDetailFieldsFragment;
  externalReferrals?: boolean;
}
const ProjectReferralPostingDetails: React.FC<Props> = ({
  referralPosting,
  externalReferrals,
}) => {
  const standardDetails: Array<[string, ReactNode]> = [
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

  // If household was referred to a particular unit type, show it
  if (referralPosting.unitType?.description) {
    standardDetails.push(['Unit Type', referralPosting.unitType.description]);
  }

  const externalDetails: Array<[string, ReactNode]> = useMemo(() => {
    if (!externalReferrals) return [];

    return [
      ['Referral ID', referralPosting.referralIdentifier], // External system identifier
      ['Score', referralPosting.score], // External system score
      [
        'Chronically Homeless', // External system chronicity status
        <YesNoDisplay
          booleanValue={referralPosting.chronic}
          fallback={<NotCollectedText variant='body2' />}
        />,
      ],
      [
        'Needs Wheelchair Accessible Unit',
        <YesNoDisplay
          booleanValue={referralPosting.needsWheelchairAccessibleUnit}
          fallback={<NotCollectedText variant='body2' />}
        />,
      ],
    ];
  }, [externalReferrals, referralPosting]);

  const customDetails: Array<[string, ReactNode]> = useMemo(() => {
    return referralPosting.customDataElements.map((element) => [
      element.label,
      customDataElementValueAsString(element),
    ]);
  }, [referralPosting]);

  return (
    <Grid container columnSpacing={6} rowSpacing={2}>
      {[standardDetails, externalDetails, customDetails]
        .filter((list) => list.length > 0)
        .map((list) => (
          <Grid item key={list[0][0]}>
            <Stack
              spacing={2}
              component={CommonUnstyledList}
              sx={{ columns: 2 }}
            >
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
