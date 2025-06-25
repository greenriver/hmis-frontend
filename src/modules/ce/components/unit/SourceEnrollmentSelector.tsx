import { Button, Stack, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';
import CommonCard from '@/components/elements/CommonCard';
import { CommonLabeledTextBlock } from '@/components/elements/CommonLabeledTextBlock';
import Loading from '@/components/elements/Loading';
import EnrollmentDateRangeWithStatus from '@/modules/hmis/components/EnrollmentDateRangeWithStatus';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { stringifyArray } from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
import { useGetCandidatePossibleSourceEnrollmentsQuery } from '@/types/gqlTypes';

interface Props {
  candidateId: string;
  selectedEnrollmentId?: string;
  setSelectedEnrollmentId: Dispatch<SetStateAction<string | undefined>>;
}

const SourceEnrollmentSelector: React.FC<Props> = ({
  candidateId,
  selectedEnrollmentId,
  setSelectedEnrollmentId,
}) => {
  const {
    data: { ceCandidate } = {},
    loading: loading,
    error: error,
  } = useGetCandidatePossibleSourceEnrollmentsQuery({
    variables: { id: candidateId },
    onCompleted: (data) => {
      const enrollments = data.ceCandidate?.enrollments.nodes;

      if (!enrollments || enrollments.length === 0)
        throw new Error(
          `Unexpected: no enrollments for candidate ${candidateId}`
        );

      if (enrollments.length === 1) setSelectedEnrollmentId(enrollments[0].id);
    },
  });

  if (loading) return <Loading />;
  if (error) throw error;

  return (
    <Stack gap={2}>
      {ceCandidate?.enrollments.nodes.map((enrollment) => {
        return (
          <CommonCard
            key={enrollment.id}
            title={`Enrollment at ${enrollment.projectName}`}
            TitleComponent='h4'
            sx={{
              backgroundColor:
                selectedEnrollmentId === enrollment.id
                  ? 'primary.surface'
                  : 'background.paper',
              borderColor:
                selectedEnrollmentId === enrollment.id
                  ? 'primary.light'
                  : 'divider',
            }}
            actions={
              <Button
                aria-live='polite'
                onClick={() => {
                  if (selectedEnrollmentId === enrollment.id) {
                    setSelectedEnrollmentId(undefined);
                  } else {
                    setSelectedEnrollmentId(enrollment.id);
                  }
                }}
              >
                {selectedEnrollmentId === enrollment.id
                  ? 'Record selected'
                  : 'Select this record'}
              </Button>
            }
          >
            <Stack gap={1}>
              <CommonLabeledTextBlock title='Project Type'>
                <HmisEnum
                  value={enrollment.projectType}
                  enumMap={HmisEnums.ProjectType}
                />
              </CommonLabeledTextBlock>

              <CommonLabeledTextBlock title='Project Name'>
                {enrollment.projectName}
              </CommonLabeledTextBlock>

              <CommonLabeledTextBlock title='Client Name'>
                {enrollment.clientName}
              </CommonLabeledTextBlock>

              <CommonLabeledTextBlock title='Enrollment Period'>
                <EnrollmentDateRangeWithStatus enrollment={enrollment} />
              </CommonLabeledTextBlock>

              <CommonLabeledTextBlock title={'Relationship to HoH'}>
                <HmisEnum
                  value={enrollment.relationshipToHoH}
                  enumMap={HmisEnums.RelationshipToHoH}
                />
              </CommonLabeledTextBlock>
              {enrollment.otherHouseholdMemberNames.length > 0 && (
                <CommonLabeledTextBlock title={'Other Household Members'}>
                  {stringifyArray(enrollment.otherHouseholdMemberNames)}
                </CommonLabeledTextBlock>
              )}

              {enrollment.assessments.length > 0 && (
                <>
                  <Typography variant={'h5'} component={'p'}>
                    Relevant Assessments
                  </Typography>
                  {enrollment.assessments.map((assessment) => (
                    <CommonLabeledTextBlock
                      key={assessment.id}
                      title={`${assessment.name}`}
                    >
                      {assessment.date}
                    </CommonLabeledTextBlock>
                  ))}
                </>
              )}
            </Stack>
          </CommonCard>
        );
      })}
    </Stack>
  );
};

export default SourceEnrollmentSelector;
