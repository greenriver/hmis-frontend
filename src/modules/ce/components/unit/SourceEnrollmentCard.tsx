import { Alert, Divider, Stack, Typography } from '@mui/material';
import React, { useId } from 'react';
import CommonSelectableCard from '@/components/elements/CommonSelectableCard';
import CommonTextWithIcon from '@/components/elements/CommonTextWithIcon';
import CommonTruncatedList from '@/components/elements/CommonTruncatedList';
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
import { CeReferralSourceEnrollmentFieldsFragment } from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

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
          {enrollment.householdSize === 1 ? (
            enrollment.clientName
          ) : (
            <CommonTruncatedList
              items={[
                enrollment.clientName,
                ...enrollment.otherHouseholdMemberNames,
              ]}
            />
          )}
        </CommonTextWithIcon>

        <Stack gap={1} direction='row' alignItems={'center'}>
          <CommonTextWithIcon
            Icon={ProjectIcon}
            IconProps={{ sx: { color: 'text.secondary' } }}
          >
            {
              // will always be true for now (otherwise the enrollment wouldn't have been resolved),
              // but in the future we will resolve enrollments here that user may not be able to view,
              // including enrollments in different data sources
              enrollment.dataSource.isCurrentDataSource &&
              enrollment.access.canViewEnrollmentDetails ? (
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
              )
            }
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
            <Alert icon={false} color='warning'>
              {assessment.assessmentName} performed{' '}
              <RelativeDateDisplay dateString={assessment.assessmentDate} />
            </Alert>
          );
        })}
      </Stack>
    </CommonSelectableCard>
  );
};

export default SourceEnrollmentCard;
