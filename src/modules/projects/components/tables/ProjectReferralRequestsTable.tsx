import { useMemo } from 'react';

import { ColumnDef } from '@/components/elements/GenericTable';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import {
  GetProjectReferralRequestsDocument,
  GetProjectReferralRequestsQuery,
  GetProjectReferralRequestsQueryVariables,
  ProjectAllFieldsFragment,
  ReferralRequestFieldsFragment,
  VoidReferralRequestDocument,
  VoidReferralRequestMutation,
  VoidReferralRequestMutationVariables,
} from '@/types/gqlTypes';

const clearCache = (projectId: string) => {
  cache.evict({
    id: `Project:${projectId}`,
    fieldName: 'referralRequests',
  });
};

interface Props {
  project: ProjectAllFieldsFragment;
}

const ProjectReferralRequestsTable: React.FC<Props> = ({ project }) => {
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
            {`${row.requestorName} <${row.requestorEmail}>`}
            <br />
            {row.requestorPhone}
          </>
        ),
      },
      {
        header: 'Action',
        render: (referralRequest: ReferralRequestFieldsFragment) => (
          <DeleteMutationButton<
            VoidReferralRequestMutation,
            VoidReferralRequestMutationVariables
          >
            queryDocument={VoidReferralRequestDocument}
            variables={{ id: referralRequest.id }}
            idPath={'data.voidReferralRequest.record.id'}
            recordName='Referral Request'
            verb='cancel'
            onSuccess={() => {
              clearCache(project.id);
            }}
            ConfirmationDialogProps={{
              confirmText: 'Confirm Cancellation',
              cancelText: 'close',
            }}
            confirmationDialogContent={
              <p>{`This will cancel the referral request at ${project.projectName} for ${referralRequest.unitType.description} requested by ${referralRequest.requestorName} for the estimated date needed of ${referralRequest.neededBy}.`}</p>
            }
          >
            Cancel Request
          </DeleteMutationButton>
        ),
      },
    ],
    [project.id, project.projectName]
  );

  return (
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
  );
};
export default ProjectReferralRequestsTable;
