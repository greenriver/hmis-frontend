import { Stack, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';
import Loading from '@/components/elements/Loading';
import SourceEnrollmentCard from '@/modules/ce/components/unit/SourceEnrollmentCard';
import { useGetCeCandidateSourceEnrollmentsQuery } from '@/types/gqlTypes';

interface Props {
  clientName: string;
  candidateId: string;
  opportunityId: string;
  selectedEnrollmentId?: string;
  setSelectedEnrollmentId: Dispatch<SetStateAction<string | undefined>>;
}

const SourceEnrollmentSelector: React.FC<Props> = ({
  clientName,
  candidateId,
  opportunityId,
  selectedEnrollmentId,
  setSelectedEnrollmentId,
}) => {
  const {
    data: { ceOpportunity } = {},
    loading: loading,
    error: error,
  } = useGetCeCandidateSourceEnrollmentsQuery({
    variables: { candidateId: candidateId, opportunityId: opportunityId },
    onCompleted: (data) => {
      const enrollments =
        data.ceOpportunity?.candidateLookup?.enrollments.nodes;

      if (!enrollments || enrollments.length === 0)
        throw new Error(
          `Unexpected: no enrollments for candidate ${candidateId}`
        );

      if (enrollments.length === 1) setSelectedEnrollmentId(enrollments[0].id);
    },
  });

  const enrollments = ceOpportunity?.candidateLookup?.enrollments.nodes;

  if (loading) return <Loading />;
  if (error) throw error;

  return (
    <>
      <Stack gap={2} direction='row'>
        <Typography variant='body1'>
          <strong>Client</strong>: {clientName}
        </Typography>

        <Typography variant='body1'>
          <strong>Enrollments</strong>: {enrollments?.length}
        </Typography>
      </Stack>
      <Stack gap={2}>
        {enrollments?.map((enrollment) => {
          return (
            <SourceEnrollmentCard
              enrollment={enrollment}
              selected={selectedEnrollmentId === enrollment.id}
              onSelect={() => setSelectedEnrollmentId(enrollment.id)}
            />
          );
        })}
      </Stack>
    </>
  );
};

export default SourceEnrollmentSelector;
