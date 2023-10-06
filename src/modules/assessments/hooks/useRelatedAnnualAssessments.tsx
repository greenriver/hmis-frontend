import { useMemo } from 'react';

import { To } from 'react-router-dom';
import {
  clientBriefName,
  relationshipToHohForDisplay,
} from '@/modules/hmis/hmisUtil';
import { useHouseholdMembers } from '@/modules/household/hooks/useHouseholdMembers';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  FormRole,
  RelationshipToHoH,
  useGetRelatedAnnualsQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

interface Args {
  householdId: string;
  enrollmentId: string;
  assessmentId?: string;
  skip?: boolean;
}

// type AssessmentResultType = NonNullable<
//   NonNullable<GetRelatedAnnualsQuery['householdAssessments']>
// >[0];

type HouseholdMemberAnnualInfo = {
  clientName: string;
  firstName: string;
  enrollmentId: string;
  relationshipToHoH: RelationshipToHoH;
  path: To;
  assessmentId?: string;
  assessmentDate?: string;
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
  const [householdMembers, { loading: hhmLoading }] =
    useHouseholdMembers(enrollmentId);
  const { data: { householdAssessments } = {}, loading: assmtsLoading } =
    useGetRelatedAnnualsQuery({
      variables: { householdId, assessmentId },
      skip,
      fetchPolicy: 'cache-and-network',
    });

  const assessmentInfo = useMemo(() => {
    if (!householdAssessments || !householdMembers) return;

    const annualInfo: HouseholdMemberAnnualInfo[] = [];

    householdAssessments.forEach(({ enrollment, client, ...assessment }) => {
      if (enrollment.id === enrollmentId) return; // skip current member

      annualInfo.push({
        clientName: `${clientBriefName(client)}${relationshipSuffix(
          enrollment.relationshipToHoH
        )}`,
        firstName: client.firstName || 'Client',
        assessmentDate: assessment.assessmentDate,
        enrollmentId: enrollment.id,
        relationshipToHoH: enrollment.relationshipToHoH,
        path: generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
          clientId: client.id,
          enrollmentId: enrollment.id,
          assessmentId: assessment.id,
          formRole: FormRole.Annual,
        }),
      });
    });

    householdMembers.forEach(({ client, enrollment, ...hhm }) => {
      if (enrollment.id === enrollmentId) return; // skip current member
      const hasAssessment = !!householdAssessments.find(
        (ha) => ha.enrollment.id === enrollment.id
      );
      if (hasAssessment) return; // skip if already included because they have an assessment

      annualInfo.push({
        clientName: `${clientBriefName(client)}${relationshipSuffix(
          hhm.relationshipToHoH
        )}`,
        firstName: client.firstName || 'Client',
        enrollmentId: enrollment.id,
        relationshipToHoH: hhm.relationshipToHoH,
        path: generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
          clientId: client.id,
          enrollmentId: enrollment.id,
          formRole: FormRole.Annual,
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
