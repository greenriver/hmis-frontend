import { EnumFilter } from '../dataFetching/types';
import { localResolvePickList } from '../form/util/formUtil';
import { PickListOption, ReferralPostingStatus } from '@/types/gqlTypes';

const sortValue = (status: ReferralPostingStatus) => {
  switch (status) {
    case ReferralPostingStatus.AssignedStatus:
      return 1;
    case ReferralPostingStatus.AcceptedPendingStatus:
      return 2;
    case ReferralPostingStatus.AcceptedStatus:
      return 3;
    case ReferralPostingStatus.DeniedPendingStatus:
      return 4;
    case ReferralPostingStatus.DeniedStatus:
      return 5;
    default:
      return 10;
  }
};

// Define a filter for ReferralPostingStatuses
export const getReferralFilter = (
  statuses: ReferralPostingStatus[]
): EnumFilter<Record<string, any>> => {
  const options = (localResolvePickList('ReferralPostingStatus', true) || [])
    .filter((opt: PickListOption) =>
      statuses.includes(opt.code as ReferralPostingStatus)
    )
    .sort(
      (a, b) =>
        sortValue(a.code as ReferralPostingStatus) -
        sortValue(b.code as ReferralPostingStatus)
    );

  return {
    enumType: 'ReferralPostingStatus',
    key: 'status',
    label: 'Status',
    multi: true,
    type: 'enum',
    pickListOptions: options,
  };
};
