import DescriptionIcon from '@mui/icons-material/Description';
import { ReactNode, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';
import EditableCustomDataElement from './EditableCustomDataElement';
import OccurrencePointValue from './EditableOccurrencePointValue';
import EnrollmentSummaryCount from './EnrollmentSummaryCount';
import IconButtonContainer from './IconButtonContainer';
import Loading from '@/components/elements/Loading';
import SimpleTable from '@/components/elements/SimpleTable';
import NotCollectedText from '@/modules/form/components/viewable/item/NotCollectedText';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import {
  parseAndFormatDate,
  pathStatusString,
  PERMANENT_HOUSING_PROJECT_TYPES,
  STREET_OUTREACH_SERVICES_ONLY,
} from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  AssessmentRole,
  Destination,
  EnrollmentFieldsFragment,
  FormRole,
  PickListType,
  ProjectType,
  useGetEnrollmentDetailsQuery,
} from '@/types/gqlTypes';
import { evictPickList } from '@/utils/cacheUtil';
import generateSafePath from '@/utils/generateSafePath';

// TODO: move to backend?
const DOE_PROJECT_TYPES = [
  ProjectType.Es, // TODO(2024) should be nbn only
  ProjectType.So,
  ProjectType.ServicesOnly,
];

const EnrollmentDetails = ({
  enrollment,
}: {
  enrollment: EnrollmentFieldsFragment;
}) => {
  const { data, error } = useGetEnrollmentDetailsQuery({
    variables: { id: enrollment.id },
  });
  const enrollmentWithDetails = useMemo(() => data?.enrollment, [data]);

  const navigate = useNavigate();
  const intakePath = useMemo(
    () =>
      generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
        clientId: enrollment.client.id,
        enrollmentId: enrollment.id,
        formRole: AssessmentRole.Intake,
        assessmentId: enrollmentWithDetails?.intakeAssessment?.id,
      }),
    [enrollment, enrollmentWithDetails]
  );
  const exitPath = useMemo(
    () =>
      generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
        clientId: enrollment.client.id,
        enrollmentId: enrollment.id,
        formRole: AssessmentRole.Exit,
        assessmentId: enrollmentWithDetails?.intakeAssessment?.id,
      }),
    [enrollment, enrollmentWithDetails]
  );

  const rows = useMemo(() => {
    if (!enrollmentWithDetails) return;
    const noneText = <NotCollectedText variant='body2'>None</NotCollectedText>;
    const content: Record<string, ReactNode> = {
      'Enrollment Status': <EnrollmentStatus enrollment={enrollment} />,
      'Entry Date': (
        // For now, only allow editing Entry Date via Intake Assessment. Link to it.
        <IconButtonContainer
          Icon={DescriptionIcon}
          onClick={() => navigate(intakePath)}
          tooltip='Go to Intake Assessment'
        >
          {parseAndFormatDate(enrollment.entryDate)}
        </IconButtonContainer>
      ),
      'Exit Date': enrollment.exitDate ? (
        <IconButtonContainer
          Icon={DescriptionIcon}
          onClick={() => navigate(exitPath)}
          tooltip='Go to Exit Assessment'
        >
          {parseAndFormatDate(enrollment.exitDate)}
        </IconButtonContainer>
      ) : (
        noneText
      ),
    };
    if (enrollment.exitDate) {
      content['Exit Destination'] = (
        <HmisEnum
          value={enrollment.exitDestination || Destination.DataNotCollected}
          enumMap={HmisEnums.Destination}
        />
      );
    }

    // Show unit if enrollment is open, or enrollment has unit.
    // it is unexpected for a closed enrollment to have an assigned unit.
    if (
      enrollmentWithDetails.project.hasUnits &&
      (!enrollment.exitDate || enrollment.currentUnit)
    ) {
      content['Assigned Unit'] = (
        <OccurrencePointValue
          formRole={FormRole.UnitAssignment}
          title={
            enrollment.currentUnit
              ? 'Change Unit Assignment'
              : 'Unit Assignment'
          }
          icon='pencil'
          enrollment={enrollment}
          onCompleted={() =>
            evictPickList(PickListType.AvailableUnitsForEnrollment, {
              projectId: enrollment.project.id,
            })
          }
        >
          {enrollment.currentUnit?.name || noneText}
        </OccurrencePointValue>
      );
    }

    const projectType = enrollment.project.projectType;
    if (projectType && PERMANENT_HOUSING_PROJECT_TYPES.includes(projectType)) {
      const title = 'Move-in Date';
      content[title] = (
        <OccurrencePointValue
          formRole={FormRole.MoveInDate}
          title={title}
          icon='calendar'
          enrollment={enrollment}
        >
          {parseAndFormatDate(enrollment.moveInDate) || noneText}
        </OccurrencePointValue>
      );
    }

    if (projectType && DOE_PROJECT_TYPES.includes(projectType)) {
      const title = 'Date of Engagement';
      content[title] = (
        <OccurrencePointValue
          formRole={FormRole.DateOfEngagement}
          title={title}
          icon='calendar'
          enrollment={enrollment}
        >
          {parseAndFormatDate(enrollment.dateOfEngagement) || noneText}
        </OccurrencePointValue>
      );
    }

    // FIXME: needs to check for funder
    if (projectType && STREET_OUTREACH_SERVICES_ONLY.includes(projectType)) {
      const title = 'PATH Status';
      content[title] = (
        <OccurrencePointValue
          formRole={FormRole.PathStatus}
          title={title}
          icon='pencil'
          enrollment={enrollment}
        >
          {pathStatusString(enrollment) || noneText}
        </OccurrencePointValue>
      );
    }

    if (
      enrollmentWithDetails &&
      enrollmentWithDetails.openEnrollmentSummary.length > 0
    ) {
      const title = 'Other Open Enrollments';
      content[title] = (
        <EnrollmentSummaryCount
          enrollmentSummary={enrollmentWithDetails.openEnrollmentSummary}
          clientId={enrollment.client.id}
        />
      );
    }

    enrollmentWithDetails.customDataElements
      .filter((cde) => cde.atOccurrence)
      .forEach((cde) => {
        content[cde.label] = (
          <EditableCustomDataElement
            element={cde}
            enrollment={enrollment}
            fallback={noneText}
          />
        );
      });

    return Object.entries(content).map(([id, value], index) => ({
      id: String(index),
      label: id,
      value,
    }));
  }, [enrollment, enrollmentWithDetails, intakePath, exitPath, navigate]);

  if (error) throw error;
  if (!enrollmentWithDetails || !rows) return <Loading />;

  return (
    <SimpleTable
      TableCellProps={{
        sx: {
          py: 2,
          '&:first-of-type': {
            pr: 4,
            width: '1px',
            whiteSpace: 'nowrap',
          },
        },
      }}
      columns={[
        {
          name: 'key',
          render: (row) => (
            <strong style={{ fontWeight: 600 }}>{row.label}</strong>
          ),
        },
        { name: 'value', render: (row) => row.value },
      ]}
      rows={rows}
    />
  );
};
export default EnrollmentDetails;
