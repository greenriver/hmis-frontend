import { Alert, AlertTitle, Skeleton, Stack, Typography } from '@mui/material';
import {
  add,
  differenceInMonths,
  getYear,
  isAfter,
  isWithinInterval,
} from 'date-fns';
import { useCallback, useMemo, useState } from 'react';

import { To } from 'react-router-dom';
import RouterLink from '@/components/elements/RouterLink';
import {
  clientBriefName,
  formatDateRange,
  parseAndFormatDate,
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
  assessmentDate?: Date;
  skip?: boolean;
}

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
  assessmentDate,
}: Args) {
  const [householdMembers, { loading: hhmLoading }] =
    useHouseholdMembers(enrollmentId);

  // fetch all annuals for this household
  const { data: { household } = {}, loading: assmtsLoading } =
    useGetHouseholdAnnualsQuery({
      variables: { id: householdId },
      skip,
      fetchPolicy: 'cache-and-network',
    });

  // Determine the "due period" that's relevant for this Assessment.
  // If it's a new assessment, choose the last due period.
  // If it's an existing assessment, choose the due period that most closely matches this assessment
  const [duePeriodStart, duePeriodEnd, duePeriodAnniversary] = useMemo(() => {
    if (!household || !householdMembers) return [];

    let duePeriod;
    if (assessmentDate) {
      duePeriod = household.annualDuePeriods.find(
        ({ startDate: startDateStr }) => {
          const startDate = parseHmisDateString(startDateStr);
          if (!startDate) return false;

          const anniversaryDate = add(startDate, { days: 30 });
          return (
            Math.abs(differenceInMonths(anniversaryDate, assessmentDate)) < 6
          );
        }
      );
    } else {
      duePeriod =
        household.annualDuePeriods[household.annualDuePeriods.length - 1];
    }

    // This household has been enrolled <11 months, or this assessment falls so far outside of a due period
    // that we can't determine which due period is relevant.
    if (!duePeriod) return [];

    const start = parseHmisDateString(duePeriod.startDate);
    const end = parseHmisDateString(duePeriod.endDate);
    const anniversary = start ? add(start, { days: 30 }) : null;
    return [start, end, anniversary];
  }, [assessmentDate, household, householdMembers]);

  // Construct annual assessment info for all household members pertaining to this due period
  const assessmentInfo = useMemo(() => {
    if (
      !household ||
      !householdMembers ||
      !duePeriodStart ||
      !duePeriodEnd ||
      !duePeriodAnniversary
    )
      return;

    const annualInfo: HouseholdMemberAnnualInfo[] = household.assessments.nodes
      // Drop any assessments outside of due period
      .filter(({ enrollment, assessmentDate }) => {
        if (enrollment.id === enrollmentId) return false; // skip current member

        const assmtDate = parseHmisDateString(assessmentDate);
        if (!assmtDate) return false;

        const isWithinDuePeriod = isWithinInterval(assmtDate, {
          start: duePeriodStart,
          end: duePeriodEnd,
        });
        return isWithinDuePeriod;
      })
      // Map to relevant info for display
      .map(({ enrollment, client, ...assessment }) => {
        return {
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
        };
      });

    // Next, add all other members that DON'T have Annuals within that target range
    const remainingHHMs: HouseholdMemberAnnualInfo[] = householdMembers
      .filter(({ enrollment }) => {
        // skip current member
        if (enrollment.id === enrollmentId) return false;

        // skip if already included
        if (!!annualInfo.find((info) => info.enrollmentId === enrollment.id)) {
          return false;
        }

        // skip hh member if they enrolled after the due period anniversary
        const entryDate = parseHmisDateString(enrollment.entryDate);
        const anniv = add(duePeriodStart, { days: 30 });
        if (entryDate && isAfter(entryDate, anniv)) {
          return false;
        }

        return true;
      })
      .map(({ client, enrollment, ...hhm }) => {
        return {
          clientName: `${clientBriefName(client)}${relationshipSuffix(
            hhm.relationshipToHoH
          )}`,
          firstName: client.firstName || 'Client',
          enrollmentId: enrollment.id,
          relationshipToHoH: hhm.relationshipToHoH,
          path: generateSafePath(EnrollmentDashboardRoutes.ASSESSMENTS, {
            clientId: client.id,
            enrollmentId: enrollment.id,
          }),
        };
      });

    return [...annualInfo, ...remainingHHMs];
  }, [
    duePeriodAnniversary,
    duePeriodEnd,
    duePeriodStart,
    enrollmentId,
    household,
    householdMembers,
  ]);

  const [alertHidden, setAlertHidden] = useState(false);

  const renderAnnualAlert = useCallback(() => {
    if (alertHidden) return null;
    // loading state
    if (!skip && !assessmentInfo && (hhmLoading || assmtsLoading)) {
      return <Skeleton variant='rectangular' width='100%' height={50} />;
    }
    // no data
    if (!assessmentInfo || assessmentInfo.length === 0) return null;
    if (!duePeriodAnniversary || !duePeriodStart || !duePeriodEnd) return null;

    return (
      <Alert
        severity='info'
        sx={{ my: 1 }}
        onClose={() => setAlertHidden(true)}
        icon={false}
      >
        <AlertTitle>
          This household's annual assessments for{' '}
          {getYear(duePeriodAnniversary)} are due between{' '}
          {formatDateRange(duePeriodStart, duePeriodEnd)}.
        </AlertTitle>

        <Stack gap={0.5} sx={{ pt: 1 }}>
          {assessmentInfo.map(
            ({ enrollmentId, clientName, firstName, assessmentDate, path }) => (
              <Stack direction={'row'} gap={1} key={enrollmentId}>
                <Typography variant='body2' fontWeight={600}>
                  {clientName}
                  {':'}
                </Typography>
                {assessmentDate ? (
                  <RouterLink to={path} openInNew>
                    {parseAndFormatDate(assessmentDate)} Annual
                  </RouterLink>
                ) : (
                  <>
                    {' '}
                    <Typography variant='body2'>No annual in range.</Typography>
                    <RouterLink to={path} openInNew>
                      View {firstName}'s assessments
                    </RouterLink>
                  </>
                )}
              </Stack>
            )
          )}
        </Stack>
      </Alert>
    );
  }, [
    alertHidden,
    assessmentInfo,
    assmtsLoading,
    duePeriodAnniversary,
    duePeriodEnd,
    duePeriodStart,
    hhmLoading,
    skip,
  ]);

  return {
    renderAnnualAlert,
    assessmentInfo,
    loading: hhmLoading || assmtsLoading,
    duePeriodStart,
    duePeriodEnd,
  } as const;
}
