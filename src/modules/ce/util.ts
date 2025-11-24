import { ProjectDashboardRoutes, Routes } from '@/routes/routes';
import { CeReferralWithProjectAccessFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

// Helper function for linking to referrals. Use this anywhere we need to link to referrals,
// except from within a project context, where we know the user already has access to view the project
export const getReferralLink = (
  referral: CeReferralWithProjectAccessFieldsFragment
) => {
  if (referral.access.canViewReferralInTargetProject) {
    // If the user can view referrals in the target project, link to the referral in the project context
    return generateSafePath(ProjectDashboardRoutes.REFERRAL, {
      projectId: referral.targetProjectId,
      referralId: referral.id,
    });
  }

  // Otherwise, link to the "floating" referral page outside of the project context
  return generateSafePath(Routes.REFERRAL, {
    referralId: referral.id,
  });
};
