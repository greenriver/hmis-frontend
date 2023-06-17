import { Box, Stack, Typography } from '@mui/material';
import { ReactNode, useMemo } from 'react';

import { CommonUntyledList } from '@/components/CommonUnstyledList';
import RouterLink from '@/components/elements/RouterLink';
import NotCollectedText from '@/modules/form/components/viewable/item/NotCollectedText';
import { hasMeaningfulValue } from '@/modules/form/util/formUtil';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import ReferralPostingStatusDisplay from '@/modules/referrals/components/ReferralPostingStatusDisplay';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  ReferralPostingDetailFieldsFragment,
  ReferralPostingStatus,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

interface Props {
  referralPosting: ReferralPostingDetailFieldsFragment;
}
const AdminReferralPostingDetails: React.FC<Props> = ({ referralPosting }) => {
  const { project } = referralPosting;
  const list: Array<[string, ReactNode]> = [
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
    ['Referral ID', referralPosting.referralIdentifier],
    ['Referral Date', parseAndFormatDate(referralPosting.referralDate)],
    ['Referred From', referralPosting.referredFrom],
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
    ['Organization Name', referralPosting.organization?.organizationName],
  ];

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

  list.push([
    `Referral ${verb} at`,
    parseAndFormatDate(referralPosting.statusNoteUpdatedAt),
  ]);
  list.push([`${verb} by`, referralPosting.statusNoteUpdatedBy]);

  return (
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
  );
};

export default AdminReferralPostingDetails;
