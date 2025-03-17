import React from 'react';
import { CeReferralStatus } from '@/types/gqlTypes';

interface Props {
  status: CeReferralStatus;
}
const ReferralStatusChip: React.FC<Props> = ({ status }) => {
  // TODO(7393) - add styles and colors, and make sure all statuses are mapped correctly
  switch (status) {
    case CeReferralStatus.Initialized:
      return 'Eligible';
    case CeReferralStatus.InProgress:
      return 'In Progress';
    case CeReferralStatus.Accepted:
      return 'Approved';
    case CeReferralStatus.Rejected:
      return 'Declined';
    default:
      return '';
  }
};

export default ReferralStatusChip;
