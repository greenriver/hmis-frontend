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

    // If the project supports referrals AND the user can view referrals, show the Referrals tab.
    // This refers to the "Referrals" sub-tab within the Project Referrals page, not the Project Referrals page itself.
    const showReferrals =
      supportsReferrals && (canViewReferrals || canViewOwnReferrals);

    // If the project supports *waitlist* referrals AND the user can view units, show the Units tab.
    // Only waitlist (not direct) referrals because it doesn't make sense to link to a unit from here if it doesn't have waitlist.
    const showAvailableUnits = supportsWaitlistReferrals && canViewUnits;

    // If the project can send direct referrals AND the user has permission to manage outgoing referrals, show the Outgoing Referrals tab
    const showOutgoingReferrals =
      sendsDirectReferrals && canManageOutgoingReferrals;

    // When to enable the 'Legacy Referrals' tab:
    //   1) if the user has "canManageIncomingReferrals". This is a legacy perm that enables the ability to manage incoming legacy referrals.
    //   2) if the user has "canManageOutgoingReferrals" and outgoing CE referrals are _not_ enabled. This permission is shared across legacy and CE.
    //      This means that if the project had legacy outgoing referrals, but now CE Outgoing Direct Referrals are enabled, the Legacy
    //      Referral tab will no longer be visible. (Unless the user has "canManageIncomingReferrals", in which case the legacy tab always shows.)
    const showLegacyReferrals =
      project.access.canManageIncomingReferrals ||
      (!sendsDirectReferrals && canManageOutgoingReferrals);

    return {
      showReferrals,
      showAvailableUnits,
      showOutgoingReferrals,
      showLegacyReferrals,
    };
  }, [project]);
}
