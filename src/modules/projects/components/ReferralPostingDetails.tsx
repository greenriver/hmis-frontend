import { Box, Grid, Stack, Typography } from '@mui/material';
import { isNil } from 'lodash-es';
import { ReactNode, useMemo } from 'react';

import { EnrollmentDashboardRoutes } from '@/app/routes';
import { CommonUnstyledList } from '@/components/CommonUnstyledList';
import NotCollectedText from '@/components/elements/NotCollectedText';
import RouterLink from '@/components/elements/RouterLink';
import YesNoDisplay from '@/components/elements/YesNoDisplay';
import { hasMeaningfulValue } from '@/modules/form/util/formUtil';
import {
  parseAndFormatDate,
  parseAndFormatDateTime,
  customDataElementValueAsString,
} from '@/modules/hmis/hmisUtil';
import ReferralPostingStatusDisplay from '@/modules/referrals/components/ReferralPostingStatusDisplay';
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

  const externalDetails: Array<[string, ReactNode]> = useMemo(() => {
    if (!externalReferrals) return [];

    return [
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
        !isNil(referralPosting.hudChronic) ? (
          <YesNoDisplay booleanValue={referralPosting.hudChronic} />
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
