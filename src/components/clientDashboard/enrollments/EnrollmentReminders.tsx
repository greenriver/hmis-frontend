import { Box } from '@mui/material';
import { sortBy } from 'lodash-es';
import { useMemo } from 'react';

import Loading from '@/components/elements/Loading';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import {
  ClientDashboardRoutes,
  EnrollmentDashboardRoutes,
} from '@/routes/routes';

import {
  AssessmentRole,
  ReminderFieldsFragment,
  ReminderTopic,
  useGetEnrollmentRemindersQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const describeReminder = (reminder: ReminderFieldsFragment): string => {
  switch (reminder.topic) {
    case ReminderTopic.AnnualAssessment:
      return 'Annual Assessment';
    case ReminderTopic.AgedIntoAdulthood:
      return 'Update Assessment';
    case ReminderTopic.IntakeIncomplete:
      return 'Intake Assessment';
    case ReminderTopic.ExitIncomplete:
      return 'Exit Assessment';
    case ReminderTopic.CurrentLivingSituation:
      return 'Current Living Situation';
  }
};

const columns: ColumnDef<ReminderFieldsFragment>[] = [
  {
    key: 'name',
    header: 'Name',
    linkTreatment: true,
    render: describeReminder,
  },
  {
    key: 'due',
    header: 'Due',
    render: ({ dueDate, overdue }) => {
      return overdue ? (
        <Box color='error.main'>Overdue</Box>
      ) : (
        `Due ${parseAndFormatDate(dueDate)}`
      );
    },
  },
];

const rowLinkTo = ({
  topic,
  client,
  enrollment,
}: ReminderFieldsFragment): string => {
  switch (topic) {
    case ReminderTopic.AnnualAssessment:
      return generateSafePath(ClientDashboardRoutes.ASSESSMENTS, {
        clientId: client.id,
        enrollmentId: enrollment.id,
        formRole: AssessmentRole.Annual,
      });
    case ReminderTopic.AgedIntoAdulthood:
      return generateSafePath(EnrollmentDashboardRoutes.ASSESSMENTS, {
        clientId: client.id,
        enrollmentId: enrollment.id,
        formRole: AssessmentRole.Update,
      });
    case ReminderTopic.IntakeIncomplete:
      return generateSafePath(EnrollmentDashboardRoutes.ASSESSMENTS, {
        clientId: client.id,
        enrollmentId: enrollment.id,
        formRole: AssessmentRole.Intake,
      });
    case ReminderTopic.ExitIncomplete:
      return generateSafePath(EnrollmentDashboardRoutes.ASSESSMENTS, {
        clientId: client.id,
        enrollmentId: enrollment.id,
        formRole: AssessmentRole.Exit,
      });
    case ReminderTopic.CurrentLivingSituation:
      return generateSafePath(
        EnrollmentDashboardRoutes.CURRENT_LIVING_SITUATIONS,
        {
          clientId: client.id,
          enrollmentId: enrollment.id,
          formRole: AssessmentRole.Exit,
        }
      );
  }
};

type Reminders = Array<ReminderFieldsFragment>;

interface Props {
  enrollmentId: string;
}
const EnrollmentReminders: React.FC<Props> = ({ enrollmentId }) => {
  const { data, loading, error } = useGetEnrollmentRemindersQuery({
    variables: { id: enrollmentId },
    fetchPolicy: 'cache-and-network', // always get fresh reminders
  });

  const displayReminders = useMemo<Reminders>(() => {
    const remindersByTopic: Record<string, Reminders> = {
      [ReminderTopic.IntakeIncomplete]: [],
      [ReminderTopic.ExitIncomplete]: [],
    };
    const results: Reminders = [];
    for (const reminder of data?.enrollment?.reminders || []) {
      const list = remindersByTopic[reminder.topic];
      if (list) {
        list.push(reminder);
      } else {
        results.push(reminder);
      }
    }
    for (const topic of Object.keys(remindersByTopic)) {
      const list = remindersByTopic[topic];
      if (!list) break;
      const item =
        list.find((r) => r.enrollment.id === enrollmentId) || list[0];
      if (item) results.push(item);
    }
    return sortBy(results, (r) => [r.dueDate, r.id]);
  }, [enrollmentId, data?.enrollment?.reminders]);

  if (error) throw error;
  if (loading) return <Loading />;
  if (displayReminders.length === 0) return null;

  return (
    <TitleCard
      title={`To Do (${displayReminders.length})`}
      sx={{ mb: 2 }}
      headerVariant='border'
    >
      <GenericTable<ReminderFieldsFragment>
        noHead
        rows={displayReminders}
        columns={columns}
        rowLinkTo={rowLinkTo}
      />
    </TitleCard>
  );
};
export default EnrollmentReminders;
