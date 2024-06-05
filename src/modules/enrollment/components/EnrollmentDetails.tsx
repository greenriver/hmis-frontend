import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Stack, Tooltip } from '@mui/material';
import { ReactNode, useMemo } from 'react';
import EnrollmentOccurrencePointForm from './EnrollmentOccurrencePointForm';
import EnrollmentSummaryCount from './EnrollmentSummaryCount';
import EntryExitDatesWithAssessmentLinks from './EntryExitDatesWithAssessmentLinks';
import {
  CommonDetailGridContainer,
  CommonDetailGridItem,
} from '@/components/elements/CommonDetailGrid';
import Loading from '@/components/elements/Loading';
import NotCollectedText from '@/components/elements/NotCollectedText';

import RouterLink from '@/components/elements/RouterLink';
import { parseOccurrencePointFormDefinition } from '@/modules/form/util/formUtil';
import EnrollmentStatus from '@/modules/hmis/components/EnrollmentStatus';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import {
  occurrencePointCollectedForEnrollment,
  parseAndFormatDate,
  yesNo,
} from '@/modules/hmis/hmisUtil';
import { DashboardEnrollment } from '@/modules/hmis/types';
import { ProjectDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import { Destination } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

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

    // Occurrence point values (move in date, date of engagement, etc.)
    enrollment.project.occurrencePointForms
      .filter((form) => occurrencePointCollectedForEnrollment(form, enrollment))
      .forEach(({ definition }) => {
        const { displayTitle, isEditable, readOnlyDefinition } =
          parseOccurrencePointFormDefinition(definition);

        content[displayTitle] = (
          <EnrollmentOccurrencePointForm
            enrollment={enrollment}
            definition={definition}
            readOnlyDefinition={readOnlyDefinition}
            editable={isEditable && enrollment.access.canEditEnrollments}
            dialogTitle={displayTitle}
          />
        );
      });

    // CoC Code. Only show if project operates in multiple CoCs.
    if (enrollment.project.projectCocs.nodesCount > 1) {
      content['Enrollment CoC'] = enrollment.enrollmentCoc || (
        <NotCollectedText />
      );
    }

    if (enrollment.client.hudChronic !== null) {
      content['HUD Chronic'] = yesNo(enrollment.client.hudChronic);
    }
    if (
      enrollment.sourceReferralPosting &&
      enrollment.project.access.canManageIncomingReferrals
    ) {
      // Basic details about the referral. If this section needs more customization, it could be implemented
      // as a read-only occurrence point form.
      content['Referral Source'] = (
        <Stack direction='row' gap={1}>
          {`Referred from ${
            enrollment.sourceReferralPosting.referredFrom
          } on ${parseAndFormatDate(
            enrollment.sourceReferralPosting.referralDate
          )}`}
          <RouterLink
            to={generateSafePath(ProjectDashboardRoutes.REFERRAL_POSTING, {
              projectId: enrollment.project.id,
              referralPostingId: enrollment.sourceReferralPosting.id,
            })}
            openInNew
          >
            View Referral
          </RouterLink>
        </Stack>
      );
    }

    const tooltips: Record<string, string> = {
      'HUD Chronic':
        'Whether this client is considered chronically homeless, as of today. Follows the HUD definition for Chronic at PIT.',
    };

    return Object.entries(content).map(([id, value], index) => ({
      id: String(index),
      label: tooltips[id] ? (
        <>
          {id}{' '}
          <Tooltip title={tooltips[id]}>
            <HelpOutlineIcon
              fontSize='small'
              sx={{ verticalAlign: 'bottom', ml: 1, color: 'text.secondary' }}
            />
          </Tooltip>
        </>
      ) : (
        id
      ),
      value,
    }));
  }, [enrollment]);

  if (!enrollment || !rows) return <Loading />;

  return (
    <CommonDetailGridContainer>
      {rows.map(({ id, label, value }) => (
        <CommonDetailGridItem label={label} key={id}>
          {value}
        </CommonDetailGridItem>
      ))}
    </CommonDetailGridContainer>
  );
};

export default EnrollmentDetails;
