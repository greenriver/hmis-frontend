import { ReactNode, useMemo } from 'react';
import EditableCustomDataElement from './EditableCustomDataElement';
import OccurrencePointValue from './EditableOccurrencePointValue';
import Loading from '@/components/elements/Loading';
import SimpleTable from '@/components/elements/SimpleTable';
import NotCollectedText from '@/modules/form/components/viewable/item/NotCollectedText';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import {
  parseAndFormatDate,
  pathStatusString,
  PERMANENT_HOUSING_PROJECT_TYPES,
  STREET_OUTREACH_SERVICES_ONLY,
} from '@/modules/hmis/hmisUtil';
import {
  EnrollmentFieldsFragment,
  FormRole,
  ProjectType,
  useGetEnrollmentDetailsQuery,
} from '@/types/gqlTypes';

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

  const rows = useMemo(() => {
    if (!enrollmentWithDetails) return;
    const noneText = <NotCollectedText variant='body2'>None</NotCollectedText>;
    const content: Record<string, ReactNode> = {
      'Enrollment Status': <EnrollmentStatus enrollment={enrollment} />,
      'Entry Date': parseAndFormatDate(enrollment.entryDate),
      'Exit Date': parseAndFormatDate(enrollment.exitDate) || noneText,
    };
    if (enrollment.exitDate) {
      content['Exit Destination'] =
        parseAndFormatDate(enrollmentWithDetails.exitDestination) || noneText;
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
          title='Change Unit Assignment'
          icon='pencil'
          enrollment={enrollment}
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
          {parseAndFormatDate(enrollmentWithDetails.moveInDate) || noneText}
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
          {parseAndFormatDate(enrollmentWithDetails.dateOfEngagement) ||
            noneText}
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
  }, [enrollment, enrollmentWithDetails]);

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
