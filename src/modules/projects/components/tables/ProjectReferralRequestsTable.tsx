import { Button } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';

import { ColumnDef } from '@/components/elements/GenericTable';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import VoidProjectReferralRequestDialog from '@/modules/projects/components/VoidProjectReferralRequestDialog';
import {
  GetProjectReferralRequestsDocument,
  GetProjectReferralRequestsQuery,
  GetProjectReferralRequestsQueryVariables,
  ProjectAllFieldsFragment,
  ReferralRequestFieldsFragment,
} from '@/types/gqlTypes';

interface Props {
  project: ProjectAllFieldsFragment;
}

const ProjectReferralRequestsTable: React.FC<Props> = ({ project }) => {
  const [voidingReferralRequest, setVoidingReferralRequest] =
    useState<ReferralRequestFieldsFragment>();
  const columns = useMemo<ColumnDef<ReferralRequestFieldsFragment>[]>(
    () => [
      {
        header: 'Requested Date',
        render: (row: ReferralRequestFieldsFragment) =>
          parseAndFormatDate(row.requestedOn),
      },
      {
        header: 'Unit Type',
        render: (row: ReferralRequestFieldsFragment) =>
          row.unitType.description,
      },
      {
        header: 'Estimated Date Needed',
        render: (row: ReferralRequestFieldsFragment) =>
          parseAndFormatDate(row.neededBy),
      },
      {
        header: 'Requestor Details',
        render: (row: ReferralRequestFieldsFragment) => (
          <>
            {`${row.requestorName} <${row}>`}
            <br />
            {row.requestorPhone}
          </>
        ),
      },
      {
        header: 'Action',
        render: (row: ReferralRequestFieldsFragment) => (
          <Button
            variant='outlined'
            color='error'
            onClick={() => setVoidingReferralRequest(row)}
          >
            Cancel Request
          </Button>
        ),
      },
    ],
    []
  );

  const handleClose = useCallback(() => {
    setVoidingReferralRequest(undefined);
  }, []);

  return (
    <>
      {voidingReferralRequest && (
        <VoidProjectReferralRequestDialog
          project={project}
          onClose={handleClose}
          referralRequest={voidingReferralRequest}
        />
      )}

      <GenericTableWithData<
        GetProjectReferralRequestsQuery,
        GetProjectReferralRequestsQueryVariables,
        ReferralRequestFieldsFragment
      >
        queryVariables={{ id: project.id }}
        queryDocument={GetProjectReferralRequestsDocument}
        columns={columns}
        noData='No referral requests.'
        pagePath='project.referralRequests'
      />
    </>
  );
};
export default ProjectReferralRequestsTable;
