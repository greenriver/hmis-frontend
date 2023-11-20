import { isAfter } from 'date-fns';
import { useMemo } from 'react';

import { To } from 'react-router-dom';
import {
  clientBriefName,
  parseHmisDateString,
  relationshipToHohForDisplay,
} from '@/modules/hmis/hmisUtil';
import { useHouseholdMembers } from '@/modules/household/hooks/useHouseholdMembers';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  FormRole,
  RelationshipToHoH,
  useGetHouseholdAnnualsQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

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
  skip,
}: Args) {
  const [householdMembers, { loading: hhmLoading }] =
    useHouseholdMembers(enrollmentId);
  const { data: { household } = {}, loading: assmtsLoading } =
    useGetHouseholdAnnualsQuery({
      variables: { id: householdId },
      skip,
      fetchPolicy: 'cache-and-network',
    });

  const assessmentInfo = useMemo(() => {
    if (!household || !householdMembers) return;

    const annualInfo: HouseholdMemberAnnualInfo[] = [];
    let targetAnnualDate: Date | null = null;

    // console.log(household.annualDuePeriods);

    // GIG FIXME NEXT!
    // identify which due period is applicable to this assessmentId, or choose the last one
    // "this years annual is due between x and x"
    // "the 2020 annual is due between x and x"

    // HHM with annuals in the range:
    // x
    // y
    // z

    // First, add all household members who have Annual Assessments within range of the "target" date (either the current assessment date or today if new)
    household.assessments.nodes.forEach(
      ({ enrollment, client, ...assessment }) => {
        if (enrollment.id === enrollmentId) {
          targetAnnualDate = parseHmisDateString(assessment.assessmentDate);
          return; // skip current member
        }
        // filter out assessments that are outside of the due period

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
      }
    );

    // Next, add all other members that DON'T have Annuals within that target range
    householdMembers.forEach(({ client, enrollment, ...hhm }) => {
      // skip current member
      if (enrollment.id === enrollmentId) return;

      // skip if already included
      if (!!annualInfo.find((info) => info.enrollmentId === enrollment.id)) {
        return;
      }

      // skip hh member if they enrolled after the target annual date
      const entryDate = parseHmisDateString(enrollment.entryDate);
      if (
        entryDate &&
        targetAnnualDate &&
        isAfter(entryDate, targetAnnualDate)
      ) {
        return;
      }

      // it should say "no annual in due period" link: go to assessments
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
  }, [enrollmentId, household, householdMembers]);

  return {
    assessmentInfo,
    loading: hhmLoading || assmtsLoading,
  } as const;
}
