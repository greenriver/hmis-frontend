import { ReactNode, useMemo } from 'react';

import EnrollmentSummaryCount from './EnrollmentSummaryCount';
import EntryExitDatesWithAssessmentLinks from './EntryExitDatesWithAssessmentLinks';
import OccurrencePointValue, {
  parseOccurrencePointFormDefinition,
} from './OccurrencePointValue';
import Loading from '@/components/elements/Loading';
import SimpleTable from '@/components/elements/SimpleTable';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { occurrencePointCollectedForEnrollment } from '@/modules/hmis/hmisUtil';
import { DashboardEnrollment } from '@/modules/hmis/types';
import { HmisEnums } from '@/types/gqlEnums';
import { Destination } from '@/types/gqlTypes';

const EnrollmentDetails = ({
  enrollment,
}: {
  enrollment: DashboardEnrollment;
}) => {
  const rows = useMemo(() => {
    const content: Record<string, ReactNode> = {};
    // If enrollment is incomplete, show that first
    if (enrollment.inProgress) {
      content['Enrollment Status'] = (
        <EnrollmentStatus enrollment={enrollment} />
      );
    }

    // Entry - Exit date, with assmt links to change them
    content['Entry / Exit Dates'] = (
      <EntryExitDatesWithAssessmentLinks enrollment={enrollment} />
    );

    // Exit Destination
    if (enrollment.exitDate) {
      content['Exit Destination'] = (
        <HmisEnum
          value={enrollment.exitDestination || Destination.DataNotCollected}
          enumMap={HmisEnums.Destination}
        />
      );
    }

    // Summary of open enrollments. Arr will be empty unless user has access to see summaries.
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
  }, [enrollment]);

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
