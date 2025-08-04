import { useMemo } from 'react';
import { ProjectAllFieldsFragment } from '@/types/gqlTypes';

export function useProjectCeVisibility(project?: ProjectAllFieldsFragment) {
  return useMemo(() => {
    if (!project) return {};

    // CE Referral features this project supports
    const {
      sendsDirectReferrals,
      supportsReferrals,
      supportsWaitlistReferrals,
    } = project.coordinatedEntryFeatures || {};

    // User permissions related to CE Referrals
    const {
      canManageOutgoingReferrals,
      canViewReferrals,
      canViewOwnReferrals,
      canViewUnits,
    } = project.access;

    // If the project supports referrals AND the user can view referrals, show the Referrals tab
    const showReferrals =
      supportsReferrals && (canViewReferrals || canViewOwnReferrals);

    // If the project supports *waitlist* referrals AND the user can view units, show the Units tab.
    // Only waitlist (not direct) referrals because it doesn't make sense to link to a unit from here if it doesn't have waitlist.
    const showAvailableUnits = supportsWaitlistReferrals && canViewUnits;

    // If the project can send direct referrals AND the user has permission to manage outgoing referrals, show the Outgoing Referrals tab
    const showOutgoingReferrals =
      sendsDirectReferrals && canManageOutgoingReferrals;

    return { showReferrals, showAvailableUnits, showOutgoingReferrals };
  }, [project]);
}
