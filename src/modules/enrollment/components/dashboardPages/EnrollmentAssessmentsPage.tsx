import { Stack } from '@mui/system';
import { useCallback, useMemo } from 'react';

import ButtonLink from '@/components/elements/ButtonLink';
import CommonMenuButton from '@/components/elements/CommonMenuButton';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import AssessmentDateWithStatusIndicator from '@/modules/hmis/components/AssessmentDateWithStatusIndicator';
import {
  formRoleDisplay,
  parseAndFormatDateTime,
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
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const FinishIntakeButton = ({
  enrollmentId,
  clientId,
  householdMembers,
}: {
  enrollmentId: string;
  clientId: string;
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
  individual,
}: {
  enrollmentId: string;
  clientId: string;
  individual: boolean;
}) => {
  const getPath = useCallback(
    (formRole: AssessmentRole) =>
      generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
        clientId,
        enrollmentId,
        formRole,
      }),
    [clientId, enrollmentId]
  );

  const pluralAssmt = individual ? 'Assessment' : 'Assessments';
  return (
    <CommonMenuButton
      title='Assessments'
      items={[
        {
          key: 'intake',
          to: getPath(AssessmentRole.Intake),
          title: `Intake ${pluralAssmt}`,
        },
        {
          key: 'exit',
          to: getPath(AssessmentRole.Exit),
          title: `Exit ${pluralAssmt}`,
        },
        { key: 'd1', divider: true },
        {
          key: 'update',
          to: getPath(AssessmentRole.Update),
          title: 'New Update Assessment',
        },
        {
          key: 'annual',
          to: getPath(AssessmentRole.Annual),
          title: `New Annual ${pluralAssmt}`,
        },
        // Custom assessments will go here..
      ]}
    />
  );
};

const AssessmentActionButtons = ({
  enrollmentId,
  clientId,
}: {
  enrollmentId: string;
  clientId: string;
}) => {
  const [householdMembers] = useHouseholdMembers(enrollmentId);
  return (
    <Stack direction='row' gap={2}>
      {householdMembers && (
        <FinishIntakeButton
          enrollmentId={enrollmentId}
          clientId={clientId}
          householdMembers={householdMembers}
        />
      )}
      <NewAssessmentMenu
        enrollmentId={enrollmentId}
        clientId={clientId}
        individual={householdMembers ? householdMembers.length === 1 : true}
      />
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
      `${parseAndFormatDateTime(e.dateUpdated)} by ${
        e.user?.name || 'Unknown User'
      }`,
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
      title='Assessments'
      actions={
        <AssessmentActionButtons
          enrollmentId={enrollmentId}
          clientId={clientId}
        />
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
