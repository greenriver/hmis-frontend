import {
  CeOpportunityStatus,
  UnitDetailFieldsFragment,
  UnitTableRowFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  unit: UnitDetailFieldsFragment | UnitTableRowFieldsFragment;
}
const UnitReferralStatus: React.FC<Props> = ({ unit }) => {
  if (unit.acceptingCeReferrals) {
    return 'Accepting Referrals';
  }

  // If the most recent opportunity is locked, that indicates there is a referral
  // in progress. Check that instead of checking `referral.status` because
  // the user may not have access to the referral, but they should still see
  // an accurate status for this unit.
  const opportunity = unit.latestOpportunity;
  if (opportunity?.status === CeOpportunityStatus.Locked) {
    return 'Referral In Progress';
  }

  return 'Not Accepting Referrals';
};
export default UnitReferralStatus;
