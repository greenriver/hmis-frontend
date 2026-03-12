import { Alert, Divider, Stack, Typography } from '@mui/material';
import React, { useId, useMemo } from 'react';
import ButtonLink from '@/components/elements/ButtonLink';
import CommonSelectableCard from '@/components/elements/CommonSelectableCard';
import CommonTextWithIcon from '@/components/elements/CommonTextWithIcon';
import CommonTruncatedList from '@/components/elements/CommonTruncatedList';
import NewTabIcon from '@/components/elements/NewTabIcon';
import RelativeDateDisplay from '@/components/elements/RelativeDateDisplay';
import RouterLink from '@/components/elements/RouterLink';
import {
  ClientIcon,
  DateRangeIcon,
  ProjectIcon,
} from '@/components/elements/SemanticIcons';
import EnrollmentDateRangeWithStatus from '@/modules/hmis/components/EnrollmentDateRangeWithStatus';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  CeReferralSourceEnrollmentFieldsFragment,
  RelationshipToHoH,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const getNameWithHohIndicator = (householdMember: {
  clientName: string;
  relationshipToHoH: RelationshipToHoH;
}) => {
  return `${householdMember.clientName}${householdMember.relationshipToHoH === RelationshipToHoH.SelfHeadOfHousehold ? ' (HoH)' : ''}`;
};

interface Props {
  enrollment: CeReferralSourceEnrollmentFieldsFragment;
  selected: boolean;
  onSelect: () => void;
}

const SourceEnrollmentCard: React.FC<Props> = ({
  enrollment,
  selected,
  onSelect,
}) => {
  const radioId = useId();

  // List of household member names, with the current client first
  const householdMemberNames = useMemo(
    () => [
      getNameWithHohIndicator(enrollment),
      ...enrollment.householdMembers
        .filter((m) => m.clientId !== enrollment.sourceClientId)
        .map(getNameWithHohIndicator),
    ],
    [enrollment]
  );

  // will always be true for now (otherwise the enrollment wouldn't have been resolved),
  // but in the future we will resolve enrollments here that user may not be able to view,
  // including enrollments in different data sources. https://github.com/open-path/Green-River/issues/7891
  const includeLinks =
    enrollment.dataSource.isCurrentDataSource &&
    enrollment.access.canViewEnrollmentDetails;

  return (
    <CommonSelectableCard
      key={enrollment.id}
      value={enrollment.id}
      selected={selected}
      onSelect={onSelect}
      ariaLabelledBy={radioId}
    >
      <Stack id={radioId} gap={1} direction='column' alignItems={'left'}>
        <CommonTextWithIcon
          Icon={ClientIcon}
          IconProps={{ sx: { color: 'text.secondary' } }}
        >
          <CommonTruncatedList items={householdMemberNames} />
        </CommonTextWithIcon>

        <Stack gap={1} direction='row' alignItems={'center'}>
          <CommonTextWithIcon
            Icon={ProjectIcon}
            IconProps={{ sx: { color: 'text.secondary' } }}
          >
            {includeLinks ? (
              <RouterLink
                aria-label={enrollment.projectName}
                to={generateSafePath(
                  EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
                  {
                    clientId: enrollment.sourceClientId,
                    enrollmentId: enrollment.id,
                  }
                )}
                openInNew={true}
              >
                {enrollment.projectName}
              </RouterLink>
            ) : (
              enrollment.projectName
            )}
          </CommonTextWithIcon>

          <Divider orientation='vertical' flexItem />

          <Typography variant={'body2'}>
            <HmisEnum
              value={enrollment.projectType}
              enumMap={HmisEnums.ProjectType}
            />
          </Typography>

          <Divider orientation='vertical' flexItem />

          <CommonTextWithIcon
            Icon={DateRangeIcon}
            IconProps={{ sx: { color: 'text.secondary' } }}
          >
            <EnrollmentDateRangeWithStatus enrollment={enrollment} />
          </CommonTextWithIcon>
        </Stack>

        {enrollment.assessments.map((assessment) => {
          return (
            <Alert
              key={assessment.id}
              icon={false}
              color='primary'
              action={
                includeLinks && (
                  <ButtonLink
                    to={generateSafePath(
                      EnrollmentDashboardRoutes.VIEW_ASSESSMENT,
                      {
                        clientId: enrollment.sourceClientId,
                        enrollmentId: enrollment.id,
                        assessmentId: assessment.id,
                      }
                    )}
                    variant={'contained'}
                    color={'grayscale'}
                    openInNew={true}
                    Icon={NewTabIcon}
                  >
                    View Assessment
                  </ButtonLink>
                )
              }
            >
              <Typography variant={'body2'}>
                {assessment.assessmentName}
              </Typography>
              <Typography variant='caption'>
                <RelativeDateDisplay
                  prefixVerb={'Assessment date'}
                  dateString={assessment.assessmentDate}
                />
                .{' '}
                <RelativeDateDisplay
                  prefixVerb={'Last updated'}
                  dateString={assessment.dateUpdated}
                />
                .
              </Typography>
            </Alert>
          );
        })}
      </Stack>
    </CommonSelectableCard>
  );
};

export default SourceEnrollmentCard;
