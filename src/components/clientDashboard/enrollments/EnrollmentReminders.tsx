import TaskAltIcon from '@mui/icons-material/TaskAlt';
import { Box, Stack, Typography } from '@mui/material';
import { isToday } from 'date-fns';
import { lowerCase, sortBy } from 'lodash-es';
import { useMemo } from 'react';
import Loading from '@/components/elements/Loading';
import GenericTable from '@/components/elements/table/GenericTable';
import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import {
  clientBriefName,
  formatRelativeDate,
  parseAndFormatDate,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  AssessmentRole,
  RelationshipToHoH,
  ReminderFieldsFragment,
  ReminderTopic,
  useGetEnrollmentRemindersQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

const reminderTitle = (reminder: ReminderFieldsFragment): string => {
  switch (reminder.topic) {
    case ReminderTopic.AnnualAssessment:
      return 'Perform Annual Assessment';
    case ReminderTopic.AgedIntoAdulthood:
      return 'Perform Update Assessment';
    case ReminderTopic.IntakeIncomplete:
      return 'Finish Intake Assessment';
    case ReminderTopic.ExitIncomplete:
      return 'Finish Exit Assessment';
    case ReminderTopic.CurrentLivingSituation:
      return 'Record Current Living Situation';
  }
};

const reminderDesciption = (
  reminder: ReminderFieldsFragment & { count?: number },
  currentClientId: string
): string | null => {
  const multiple = reminder.count && reminder.count > 1;
  const notCurrentClient = reminder.client.id !== currentClientId;
  const clientName = clientBriefName(reminder.client);
  switch (reminder.topic) {
    case ReminderTopic.AnnualAssessment:
      const dueDate = parseHmisDateString(reminder.dueDate);
      if (!dueDate) return null;
      return reminder.overdue && isToday(dueDate)
        ? `Annual assessment is due today.`
        : reminder.overdue
        ? `Annual was due ${lowerCase(formatRelativeDate(dueDate))}.`
        : `Annual is due ${lowerCase(formatRelativeDate(dueDate))}.`;
    case ReminderTopic.AgedIntoAdulthood:
      return notCurrentClient
        ? `${clientName} turned 18.`
        : 'Client turned 18.';
    case ReminderTopic.IntakeIncomplete:
      return multiple
        ? `${reminder.count} intake assessments have not been submitted.`
        : notCurrentClient
        ? `${clientName}'s intake assessment has not been submitted.`
        : null;
    case ReminderTopic.ExitIncomplete:
      return multiple
        ? `${reminder.count} exit assessments have been started.`
        : notCurrentClient
        ? `${clientName}'s exit assessment has been started.`
        : null;
    case ReminderTopic.CurrentLivingSituation:
      return notCurrentClient
        ? `Due for ${clientName}.`
        : 'Living situation should be recorded every 90 days.';
  }
};

const generateColumns = (
  currentClientId: string
): ColumnDef<ReminderFieldsFragment>[] => [
  {
    key: 'name',
    header: 'Name',
    render: (reminder: ReminderFieldsFragment) => {
      return (
        <Stack gap={0.4}>
          <Typography
            variant='inherit'
            sx={{
              color: 'links',
              textDecoration: 'underline',
              textDecorationColor: 'links',
            }}
          >
            {reminderTitle(reminder)}
          </Typography>
          <Typography color='text.secondary' variant='inherit'>
            {reminderDesciption(reminder, currentClientId)}
          </Typography>
        </Stack>
      );
    },
  },
  {
    key: 'due',
    header: 'Due',
    render: ({ dueDate, overdue }) => {
      return overdue ? (
        <Box color='error.main' fontWeight={600} alignSelf='flex-start'>
          Overdue
        </Box>
      ) : dueDate ? (
        <Box alignSelf='flex-start' flexShrink={0}>{`Due ${parseAndFormatDate(
          dueDate
        )}`}</Box>
      ) : null;
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
      return generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
        clientId: client.id,
        enrollmentId: enrollment.id,
        formRole: AssessmentRole.Annual,
      });
    case ReminderTopic.AgedIntoAdulthood:
      return generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
        clientId: client.id,
        enrollmentId: enrollment.id,
        formRole: AssessmentRole.Update,
      });
    case ReminderTopic.IntakeIncomplete:
      return generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
        clientId: client.id,
        enrollmentId: enrollment.id,
        formRole: AssessmentRole.Intake,
      });
    case ReminderTopic.ExitIncomplete:
      return generateSafePath(EnrollmentDashboardRoutes.ASSESSMENT, {
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

type Reminders = Array<ReminderFieldsFragment & { count?: number }>;

interface Props {
  enrollmentId: string;
}
const EnrollmentReminders: React.FC<Props> = ({ enrollmentId }) => {
  const { data, loading, error } = useGetEnrollmentRemindersQuery({
    variables: { id: enrollmentId },
    fetchPolicy: 'cache-and-network', // always get fresh reminders
  });

  const { enrollment } = useEnrollmentDashboardContext();

  const displayReminders = useMemo<Reminders>(() => {
    // reminders for these topics are deduplicated
    const remindersByTopic: Record<string, Reminders> = {
      [ReminderTopic.AnnualAssessment]: [],
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

      // when multiple reminders of same topic, return the one for
      // the current enrollment, then check for HOH, then return last
      const item =
        list.find((r) => r.enrollment.id === enrollmentId) ||
        list.find(
          (r) =>
            r.enrollment.relationshipToHoH ===
            RelationshipToHoH.SelfHeadOfHousehold
        ) ||
        sortBy(list, 'id').pop();

      if (item) results.push({ ...item, count: list.length });
    }
    return sortBy(results, 'id');
  }, [enrollmentId, data?.enrollment?.reminders]);

  const columns = useMemo(
    () => (enrollment ? generateColumns(enrollment.client.id) : []),
    [enrollment]
  );

  if (error) throw error;

  if (!enrollment) return <NotFound />;

  return (
    <TitleCard
      title={
        loading && !data
          ? 'Household Tasks'
          : `Household Tasks (${displayReminders.length})`
      }
      headerSx={{ '.MuiTypography-root': { fontWeight: 800 } }}
    >
      {loading && !data ? (
        <Loading />
      ) : (
        <GenericTable<ReminderFieldsFragment>
          noHead
          rows={displayReminders}
          columns={columns}
          rowLinkTo={
            enrollment.access.canEditEnrollments ? rowLinkTo : undefined
          }
          rowSx={() => ({ '&:nth-last-of-type(1) td': { pb: 1 } })}
          noData={
            <Stack
              direction={'row'}
              alignItems='center'
              justifyContent='center'
              gap={1}
            >
              <TaskAltIcon fontSize='small' />
              <Typography variant='body2'>All tasks complete</Typography>
            </Stack>
          }
        />
      )}
    </TitleCard>
  );
};
export default EnrollmentReminders;
