import { useMemo } from 'react';

import { To } from 'react-router-dom';
import { EnrollmentDashboardRoutes } from '@/app/routes';
import {
  clientBriefName,
  relationshipToHohForDisplay,
} from '@/modules/hmis/hmisUtil';
import { useHouseholdMembers } from '@/modules/household/hooks/useHouseholdMembers';
import { RelationshipToHoH, useGetRelatedAnnualsQuery } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Args {
  householdId: string;
  enrollmentId: string;
  assessmentId?: string;
  skip?: boolean;
}

type HouseholdMemberAnnualInfo = {
  clientName: string;
  firstName: string;
  enrollmentId: string;
  relationshipToHoH: RelationshipToHoH;
  path: To;
  assessmentDate: string;
};

function relationshipSuffix(relationship: RelationshipToHoH) {
  const formatted = relationshipToHohForDisplay(relationship, true);
  return formatted ? ` (${formatted})` : '';
}

export function useRelatedAnnualAssessments({
  enrollmentId,
  householdId,
  assessmentId,
  skip,
}: Args) {
  const [householdMembers, { loading: hhmLoading }] = useHouseholdMembers(
    enrollmentId,
    skip
  );
  const { data: { householdAssessments } = {}, loading: assmtsLoading } =
    useGetRelatedAnnualsQuery({
      variables: { householdId, assessmentId },
      skip,
      fetchPolicy: 'cache-and-network',
    });

  const assessmentInfo = useMemo(() => {
    if (!householdAssessments || !householdMembers) return;

    const annualInfo: HouseholdMemberAnnualInfo[] = [];
    // Add all household members who have Annual Assessments within range of the "target" date (either the current assessment date or today if new)
    householdAssessments.forEach(({ enrollment, client, ...assessment }) => {
      if (enrollment.id === enrollmentId) {
        return; // skip current member
      }

      annualInfo.push({
        clientName: `${clientBriefName(client)}${relationshipSuffix(
          enrollment.relationshipToHoH
        )}`,
        firstName: client.firstName || 'Client',
        assessmentDate: assessment.assessmentDate,
        enrollmentId: enrollment.id,
        relationshipToHoH: enrollment.relationshipToHoH,
        path: generateSafePath(EnrollmentDashboardRoutes.VIEW_ASSESSMENT, {
          clientId: client.id,
          enrollmentId: enrollment.id,
          assessmentId: assessment.id,
        }),
      });
    });

    return annualInfo;
  }, [enrollmentId, householdAssessments, householdMembers]);

  return {
    assessmentInfo,
    loading: hhmLoading || assmtsLoading,
  } as const;
}
