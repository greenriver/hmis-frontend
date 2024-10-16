import { Box, Stack, Typography } from '@mui/material';
import { startCase } from 'lodash-es';
import { ReactNode, useMemo } from 'react';

import ConsumerSummaryReportButton from './ConsumerSummaryReportButton';
import { CommonUnstyledList } from '@/components/CommonUnstyledList';
import NotCollectedText from '@/components/elements/NotCollectedText';
import RouterLink from '@/components/elements/RouterLink';
import TitleCard from '@/components/elements/TitleCard';
import { hasMeaningfulValue } from '@/modules/form/util/formUtil';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import {
  parseAndFormatDate,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
import ReferralPostingStatusDisplay from '@/modules/referrals/components/ReferralPostingStatusDisplay';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  ReferralPostingDetailFieldsFragment,
  ReferralPostingStatus,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  referralPosting: ReferralPostingDetailFieldsFragment;
  externalReferrals?: boolean;
}
const AdminReferralPostingDetails: React.FC<Props> = ({
  referralPosting,
  externalReferrals,
}) => {
  const verb = useMemo<string>(() => {
    switch (referralPosting.status) {
      case ReferralPostingStatus.DeniedPendingStatus:
      case ReferralPostingStatus.DeniedStatus:
        return 'Denied';
      case ReferralPostingStatus.AcceptedPendingStatus:
      case ReferralPostingStatus.AcceptedStatus:
        return 'Accepted';
      case ReferralPostingStatus.AssignedStatus:
        return 'Assigned';
      case ReferralPostingStatus.ClosedStatus:
        return 'Closed';
      default:
        return 'Status Updated';
    }
  }, [referralPosting.status]);

  const attributeList = useMemo<Array<[string, ReactNode]>>(() => {
    const { project } = referralPosting;
    const list: Array<[string, ReactNode]> = [
      [
        'Referral Status',
        <ReferralPostingStatusDisplay
          status={referralPosting.status}
          sx={{ mt: 0.5 }}
        />,
      ],
      ['Referral ID', referralPosting.referralIdentifier],
      ['Referral Date', parseAndFormatDate(referralPosting.referralDate)],
      ['Referred From', referralPosting.referredFrom],
      ['Organization Name', referralPosting.organization?.organizationName],
      [
        'Project Name',
        project ? (
          <RouterLink
            to={generateSafePath(Routes.PROJECT, {
              projectId: project.id,
            })}
            openInNew
          >
            {project.projectName}
          </RouterLink>
        ) : undefined,
      ],
      [
        'Project Type',
        <HmisEnum
          value={referralPosting.project?.projectType}
          enumMap={HmisEnums.ProjectType}
        />,
      ],
      ['Assigned At', parseAndFormatDateTime(referralPosting.assignedDate)],
    ];
    list.push([
      `${startCase(verb)} at`,
      referralPosting.statusUpdatedAt
        ? parseAndFormatDateTime(referralPosting.statusUpdatedAt)
        : null,
    ]);
    list.push([`${verb} by`, referralPosting.statusUpdatedBy]);
    return list;
  }, [referralPosting, verb]);

  return (
    <Stack gap={2}>
      <TitleCard title='Referral Details' padded>
        <Stack gap={2} component={CommonUnstyledList} sx={{ columns: 2 }}>
          {attributeList
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
      </TitleCard>
      <Stack gap={2}>
        {referralPosting.referralIdentifier && externalReferrals && (
          <ConsumerSummaryReportButton
            referralIdentifier={referralPosting.referralIdentifier}
          />
        )}
      </Stack>
    </Stack>
  );
};

export default AdminReferralPostingDetails;
