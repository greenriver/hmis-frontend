import { Box, Stack, TableCell, TableRow, Typography } from '@mui/material';
import React, { Dispatch, SetStateAction } from 'react';
import SourceEnrollmentCard from '@/modules/ce/components/unit/SourceEnrollmentCard';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  CeReferralSourceEnrollmentFieldsFragment,
  GetCeCandidateSourceEnrollmentsDocument,
  GetCeCandidateSourceEnrollmentsQuery,
  GetCeCandidateSourceEnrollmentsQueryVariables,
} from '@/types/gqlTypes';

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
  // TODO(#7890) Support moving forward with the referral for an unenrolled client

  return (
    <>
      <Stack gap={2} direction='row'>
        <Typography variant='body1'>
          <strong>Client</strong>: {clientName}
        </Typography>
      </Stack>
      <Box role='radiogroup' aria-label='Select source enrollment'>
        <GenericTableWithData<
          GetCeCandidateSourceEnrollmentsQuery,
          GetCeCandidateSourceEnrollmentsQueryVariables,
          CeReferralSourceEnrollmentFieldsFragment
        >
          noHead
          noSort
          queryVariables={{
            candidateId: candidateId,
            opportunityId: opportunityId,
          }}
          queryDocument={GetCeCandidateSourceEnrollmentsDocument}
          columns={[]}
          pagePath='ceOpportunity.candidateLookup.enrollments'
          recordType='Enrollment'
          paginationItemName='enrollment'
          defaultPageSize={5}
          rowsPerPageOptions={[5, 10]}
          renderRow={(enrollment: CeReferralSourceEnrollmentFieldsFragment) => (
            <TableRow key={enrollment.id}>
              <TableCell sx={{ py: 1, border: 'none' }}>
                <SourceEnrollmentCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  selected={selectedEnrollmentId === enrollment.id}
                  onSelect={() => setSelectedEnrollmentId(enrollment.id)}
                />
              </TableCell>
            </TableRow>
          )}
        />
      </Box>
    </>
  );
};

export default SourceEnrollmentSelector;
