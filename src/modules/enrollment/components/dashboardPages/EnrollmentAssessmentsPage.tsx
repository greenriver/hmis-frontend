import { Stack } from '@mui/system';
import { isEmpty } from 'lodash-es';
import { useCallback, useMemo } from 'react';

import ButtonLink from '@/components/elements/ButtonLink';
import CommonMenuButton, {
  NavMenuItem,
} from '@/components/elements/CommonMenuButton';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import AssessmentDateWithStatusIndicator from '@/modules/hmis/components/AssessmentDateWithStatusIndicator';
import {
  formRoleDisplay,
  parseAndFormatDateTime,
  clientBriefName,
} from '@/modules/hmis/hmisUtil';
import { useHouseholdMembers } from '@/modules/household/hooks/useHouseholdMembers';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  AssessmentFieldsFragment,
  AssessmentRole,
  GetEnrollmentAssessmentsDocument,
  GetEnrollmentAssessmentsQuery,
  GetEnrollmentAssessmentsQueryVariables,
  HouseholdClientFieldsFragment,
  useGetEnrollmentAssessmentsQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const FinishIntakeButton = ({
  enrollmentId,
  clientId,
  householdMembers,
  assessmentId,
}: {
  enrollmentId: string;
  clientId: string;
  assessmentId?: string;
  householdMembers: HouseholdClientFieldsFragment[];
}) => {
  const numIncompleteIntakes = useMemo(() => {
    return householdMembers.filter((c) => !!c.enrollment.inProgress).length;
  }, [householdMembers]);

  if (numIncompleteIntakes < 1) return null;

  const intakePath = generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
    clientId,
    enrollmentId,
    formRole: AssessmentRole.Intake,
    assessmentId,
  });
  return (
    <ButtonLink color='error' variant='contained' to={intakePath}>
      Finish Intake
    </ButtonLink>
  );
};

const NewAssessmentMenu = ({
  enrollmentId,
  clientId,
}: {
  enrollmentId: string;
  clientId: string;
}) => {
  const { enrollment } = useEnrollmentDashboardContext();
  const { data: assessmentData } = useGetEnrollmentAssessmentsQuery({
    variables: { id: enrollmentId },
  });
  const getPath = useCallback(
    (formRole: AssessmentRole) =>
      generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
        clientId,
        enrollmentId,
        formRole,
      }),
    [clientId, enrollmentId]
  );

  const items: NavMenuItem[] = useMemo(() => {
    if (!enrollment) return [];
    const assessments = assessmentData?.enrollment?.assessments?.nodes || [];
    const hasIntake = !!assessments.find(
      (a) => a.role === AssessmentRole.Intake
    );

    // If enrollment IS WIP, the action is to finish the intake assessment.s
    if (enrollment.inProgress) return [];

    const topItems: NavMenuItem[] = [];
    const bottomItems: NavMenuItem[] = [];

    // Edge case: show "intake" item if the client is entered but does not have an intake
    if (!hasIntake) {
      topItems.push({
        key: 'intake',
        to: getPath(AssessmentRole.Intake),
        title: 'HUD Intake Assessment',
      });
    }

    // Exit/Update/Annual can only be added to open enrollment
    if (!enrollment.exitDate) {
      topItems.push({
        key: 'exit',
        to: getPath(AssessmentRole.Exit),
        title: 'HUD Exit Assessment',
      });
      bottomItems.push(
        {
          key: 'update',
          to: getPath(AssessmentRole.Update),
          title: 'New HUD Update Assessment',
        },
        {
          key: 'annual',
          to: getPath(AssessmentRole.Annual),
          title: 'New HUD Annual Assessment',
        }
      );
    }

    return [
      ...topItems,
      ...(!isEmpty(topItems) && !isEmpty(bottomItems)
        ? [{ key: 'd1', divider: true }]
        : []),
      ...bottomItems,
    ];
  }, [enrollment, getPath, assessmentData]);

  if (isEmpty(items)) return null;

  return <CommonMenuButton title='Assessments' items={items} />;
};

const AssessmentActionButtons = ({
  enrollmentId,
  clientId,
}: {
  enrollmentId: string;
  clientId: string;
}) => {
  const [householdMembers] = useHouseholdMembers(enrollmentId);
  const { data: assessmentData } = useGetEnrollmentAssessmentsQuery({
    variables: { id: enrollmentId },
  });
  const assessments = assessmentData?.enrollment?.assessments?.nodes;
  const intakeAssessment = assessments?.find(
    (a) => a.role === AssessmentRole.Intake
  );

  return (
    <Stack direction='row' gap={2}>
      {householdMembers && (
        <FinishIntakeButton
          enrollmentId={enrollmentId}
          clientId={clientId}
          householdMembers={householdMembers}
          assessmentId={intakeAssessment?.id}
        />
      )}
      <NewAssessmentMenu enrollmentId={enrollmentId} clientId={clientId} />
    </Stack>
  );
};

// FIXME: share configuration with AllAssesments component
const columns: ColumnDef<AssessmentFieldsFragment>[] = [
  {
    header: 'Assessment Date',
    render: (a) => <AssessmentDateWithStatusIndicator assessment={a} />,
  },
  {
    header: 'Assessment Type',
    render: (assessment) => formRoleDisplay(assessment),
    linkTreatment: true,
  },
  {
    header: 'Last Updated',
    render: (e) =>
      `${
        e.dateUpdated ? parseAndFormatDateTime(e.dateUpdated) : 'Unknown Date'
      } by ${e.user?.name || 'Unknown User'}`,
  },
];

const AssessmentsTable = () => {
  const { enrollment } = useEnrollmentDashboardContext();
  const enrollmentId = enrollment?.id;
  const clientId = enrollment?.client.id;
  const rowLinkTo = useCallback(
    (assessment: AssessmentFieldsFragment) =>
      generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
        clientId,
        enrollmentId,
        assessmentId: assessment.id,
        formRole: assessment.role,
      }),
    [clientId, enrollmentId]
  );

  if (!enrollment || !enrollmentId || !clientId) return <NotFound />;

  return (
    <TitleCard
      title={`${
        enrollment.householdSize > 1 ? clientBriefName(enrollment.client) : ''
      } Assessments`}
      actions={
        enrollment.access.canEditEnrollments && (
          <AssessmentActionButtons
            enrollmentId={enrollmentId}
            clientId={clientId}
          />
        )
      }
      headerVariant='border'
      data-testid='enrollmentAssessmentsCard'
    >
      <GenericTableWithData<
        GetEnrollmentAssessmentsQuery,
        GetEnrollmentAssessmentsQueryVariables,
        AssessmentFieldsFragment
      >
        showFilters
        queryVariables={{ id: enrollmentId }}
        queryDocument={GetEnrollmentAssessmentsDocument}
        rowLinkTo={rowLinkTo}
        columns={columns}
        pagePath='enrollment.assessments'
        noData='No assessments'
        recordType='Assessment'
        headerCellSx={() => ({ color: 'text.secondary' })}
      />
    </TitleCard>
  );
};

export default AssessmentsTable;
