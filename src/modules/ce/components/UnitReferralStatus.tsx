import {
  CeReferralStatus,
  UnitDetailFieldsFragment,
  UnitTableRowFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  unit: UnitDetailFieldsFragment | UnitTableRowFieldsFragment;
}
const UnitReferralStatus: React.FC<Props> = ({ unit }) => {
  const opportunity = unit.latestOpportunity;
  const referral = opportunity?.referral;

  if (unit.acceptingCeReferrals) {
    return 'Accepting Referrals';
  }

  if (referral && referral.status === CeReferralStatus.InProgress) {
    return 'Referral In Progress';
  }

  return 'Not Accepting Referrals';
};
export default UnitReferralStatus;
