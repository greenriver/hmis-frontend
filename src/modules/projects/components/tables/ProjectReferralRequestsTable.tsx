import { useMemo } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  parseAndFormatDate,
  parseAndFormatDateTime,
} from '@/modules/hmis/hmisUtil';
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
        header: 'ID',
        render: 'identifier',
      },
      {
        header: 'Request Date',
        render: (row: ReferralRequestFieldsFragment) =>
          parseAndFormatDateTime(row.requestedOn),
      },
      {
        header: 'Requested By',
        render: (row: ReferralRequestFieldsFragment) => (
          <>
            {`${row.requestorName} <${row.requestorEmail}>`}
            <br />
            {row.requestorPhone}
          </>
        ),
      },
      {
        header: 'Estimated Date Needed',
        render: (row: ReferralRequestFieldsFragment) =>
          parseAndFormatDate(row.neededBy),
      },
      {
        header: 'Unit Type',
        render: (row: ReferralRequestFieldsFragment) =>
          row.unitType.description,
      },
      {
        key: 'action',
        linkTreatment: true,
        render: (referralRequest: ReferralRequestFieldsFragment) => (
          <DeleteMutationButton<
            VoidReferralRequestMutation,
            VoidReferralRequestMutationVariables
          >
            queryDocument={VoidReferralRequestDocument}
            variables={{ id: referralRequest.id }}
            idPath='voidReferralRequest.record.id'
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
              <p>
                This will cancel the referral request for a{' '}
                <b>{referralRequest.unitType.description}</b> requested by{' '}
                <b>{referralRequest.requestorName}</b> on{' '}
                <b>{parseAndFormatDateTime(referralRequest.requestedOn)}</b>.
              </p>
            }
            ButtonProps={{ size: 'small' }}
          >
            Cancel Request
          </DeleteMutationButton>
        ),
      },
    ],
    [project.id]
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
      noData='No referral requests'
      pagePath='project.referralRequests'
    />
  );
};
export default ProjectReferralRequestsTable;
