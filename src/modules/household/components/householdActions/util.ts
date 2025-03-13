import {
  HouseholdClientFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';

export const getSplitDisabledAttrs = ({
  canSplitHouseholds,
  loading,
  householdClient,
  householdSize,
}: {
  canSplitHouseholds: boolean;
  loading: boolean;
  householdClient: HouseholdClientFieldsFragment;
  householdSize: number;
}) => {
  if (!canSplitHouseholds)
    return {
      disabled: true,
      disabledReason:
        "You don't have permission to split households. Request permission from your HMIS administrator.",
    };

  if (loading)
    return {
      disabled: true,
    };

  if (
    householdClient.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
  ) {
    return {
      disabled: true,
      disabledReason: 'Head of Household cannot be split',
    };
  }

  if (householdSize <= 1) {
    return {
      disabled: true,
      disabledReason: "The household's sole member cannot be split",
    };
  }

  return {};
};

export const getDeleteEnrollmentDisabledAttrs = ({
  loading,
  currentDashboardEnrollmentId,
  householdClient,
  householdSize,
}: {
  loading: boolean;
  currentDashboardEnrollmentId?: string;
  householdClient: HouseholdClientFieldsFragment;
  householdSize: number;
}) => {
  if (loading)
    return {
      disabled: true,
    };

  // HoH cannot be removed if there are other members in the household
  if (
    householdClient.relationshipToHoH ===
      RelationshipToHoH.SelfHeadOfHousehold &&
    householdSize > 1
  ) {
    return {
      disabled: true,
      disabledReason:
        'HoH cannot be removed. Change HoH or remove other members first.',
    };
  }

  if (!householdClient.enrollment.inProgress) {
    return {
      disabled: true,
      disabledReason:
        'Client with completed enrollment cannot be removed. Exit the client instead.',
    };
  }

  if (
    householdClient.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold
  ) {
    return {
      disabled: true,
      disabledReason: 'Head of Household cannot be removed.',
    };
  }

  if (householdClient.enrollment.id === currentDashboardEnrollmentId) {
    return {
      disabled: true,
      disabledReason:
        "Currently active client cannot be removed. Go to another member's profile to remove them.",
    };
  }

  return {};
};
