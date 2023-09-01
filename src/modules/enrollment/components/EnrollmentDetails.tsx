import DescriptionIcon from '@mui/icons-material/Description';
import { ReactNode, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';
import EnrollmentSummaryCount from './EnrollmentSummaryCount';
import IconButtonContainer from './IconButtonContainer';
import OccurrencePointValue, {
  parseOccurrencePointFormDefinition,
} from './OccurrencePointValue';
import Loading from '@/components/elements/Loading';
import NotCollectedText from '@/components/elements/NotCollectedText';
import SimpleTable from '@/components/elements/SimpleTable';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import {
  occurrencePointCollectedForEnrollment,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import { DashboardEnrollment } from '@/modules/hmis/types';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import { AssessmentRole, Destination } from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const EnrollmentDetails = ({
  enrollment,
}: {
  enrollment: DashboardEnrollment;
}) => {
  const navigate = useNavigate();
  const intakePath = useMemo(
    () =>
      generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
        clientId: enrollment.client.id,
        enrollmentId: enrollment.id,
        formRole: AssessmentRole.Intake,
        assessmentId: enrollment.intakeAssessment?.id,
      }),
    [enrollment]
  );
  const exitPath = useMemo(
    () =>
      generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
        clientId: enrollment.client.id,
        enrollmentId: enrollment.id,
        formRole: AssessmentRole.Exit,
        assessmentId: enrollment.exitAssessment?.id,
      }),
    [enrollment]
  );

  const rows = useMemo(() => {
    const noneText = <NotCollectedText variant='body2'>None</NotCollectedText>;
    const canLinkToIntake =
      enrollment.access.canEditEnrollments || !enrollment.inProgress;

    const content: Record<string, ReactNode> = {
      'Enrollment Status': <EnrollmentStatus enrollment={enrollment} />,
      'Entry Date': canLinkToIntake ? (
        <IconButtonContainer
          Icon={DescriptionIcon}
          onClick={() => navigate(intakePath)}
          tooltip='Go to Intake Assessment'
        >
          {parseAndFormatDate(enrollment.entryDate)}
        </IconButtonContainer>
      ) : (
        parseAndFormatDate(enrollment.entryDate)
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

    if (enrollment && enrollment.openEnrollmentSummary.length > 0) {
      const title = 'Other Open Enrollments';
      content[title] = (
        <EnrollmentSummaryCount
          enrollmentSummary={enrollment.openEnrollmentSummary}
          clientId={enrollment.client.id}
        />
      );
    }

    enrollment.project.occurrencePointForms
      .filter((form) => occurrencePointCollectedForEnrollment(form, enrollment))
      .forEach(({ definition }) => {
        const { displayTitle, isEditable, readOnlyDefinition } =
          parseOccurrencePointFormDefinition(definition);

        content[displayTitle] = (
          <OccurrencePointValue
            enrollment={enrollment}
            definition={definition}
            readOnlyDefinition={readOnlyDefinition}
            editable={isEditable && enrollment.access.canEditEnrollments}
            dialogTitle={displayTitle}
          />
        );
      });

    return Object.entries(content).map(([id, value], index) => ({
      id: String(index),
      label: id,
      value,
    }));
  }, [enrollment, intakePath, exitPath, navigate]);

  if (!enrollment || !rows) return <Loading />;

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
