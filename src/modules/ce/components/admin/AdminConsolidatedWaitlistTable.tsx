import { Paper } from '@mui/material';
import { capitalize } from 'lodash-es';
import React, { useCallback } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { DataColumnDef } from '@/modules/dataFetching/types';
import { parseAndFormatDateTime } from '@/modules/hmis/hmisUtil';
import {
  GetAdminConsolidatedWaitlistDocument,
  GetAdminConsolidatedWaitlistQuery,
  GetAdminConsolidatedWaitlistQueryVariables,
} from '@/types/gqlTypes';
import { ensureArray } from '@/utils/arrays';

type Row = NonNullable<
  GetAdminConsolidatedWaitlistQuery['consolidatedWaitlist']
>['nodes'][0];

const COLUMNS: DataColumnDef<
  Row,
  GetAdminConsolidatedWaitlistQueryVariables
>[] = [
  // {
  //   key: 'clientId',
  //   header: 'Client ID',
  //   render: 'clientId',
  // },
  {
    key: 'clientName',
    header: 'Client Name',
    render: 'clientName',
  },
  {
    key: 'projectName',
    header: 'Project',
    render: 'projectName',
  },
  {
    key: 'unitGroupName',
    header: 'Unit Group',
    render: 'unitGroupName',
  },

  // {
  //   key: 'projectId',
  //   header: 'Project ID',
  //   render: 'projectId',
  // },
  {
    key: 'organizationName',
    header: 'Organization',
    render: 'organizationName',
    optional: { defaultHidden: true },
  },
  {
    key: 'whenAddedToCandidatePool',
    header: 'Added to Candidate Pool',
    render: ({ whenAddedToCandidatePool }) =>
      whenAddedToCandidatePool
        ? parseAndFormatDateTime(whenAddedToCandidatePool)
        : '',
    optional: { defaultHidden: true },
  },
  {
    key: 'whenUpdatedInCandidatePool',
    header: 'Updated in Candidate Pool',
    render: ({ whenUpdatedInCandidatePool }) =>
      whenUpdatedInCandidatePool
        ? parseAndFormatDateTime(whenUpdatedInCandidatePool)
        : '',
    optional: { defaultHidden: true },
  },
  {
    key: 'priorityScore',
    header: 'Priority Score',
    render: 'priorityScore',
  },
  {
    key: 'clientAge',
    header: 'Priority Score',
    render: 'priorityScore',
  },
  // {
  //   key: 'clientAttributes',
  //   header: 'Client Attributes',
  //   render: ({ clientAttributes }) => {
  //     return (
  //       <>
  //         {Object.keys(clientAttributes).map((key) => (
  //           <div key={key}>
  //             <strong>{key}:</strong>{' '}
  //             {ensureArray(clientAttributes[key]).join(', ')}
  //           </div>
  //         ))}
  //       </>
  //     );
  //   },
  // },
];

const getCustomAttributeColumns = (rows: Row[]) => {
  if (!rows || rows.length === 0) return [];

  function generateColumnDefinition(key: string) {
    return {
      key: key,
      header: key
        .replace(/^cde.custom_assessment./, '')
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2'),
      render: (row: Row) => {
        if (!row.clientAttributes) return null;
        return ensureArray(row.clientAttributes[key]).join(', ');
      },
      // optional: { defaultHidden: true },
    };
  }

  const columnsByKey: Record<string, ColumnDef<Row>> = {};
  rows.forEach((row) => {
    Object.keys(row.clientAttributes).forEach((key) => {
      if (columnsByKey[key]) return; // seen
      columnsByKey[key] = generateColumnDefinition(key);
    });
  });

  // sort columns by CDED Key so they always appear in the same order
  return Object.keys(columnsByKey)
    .sort()
    .map((key) => columnsByKey[key]);
};

interface Props {}
const ConsolidatedWaitlistTable: React.FC<Props> = ({}) => {
  const getColumnDefs = useCallback((rows: Row[]) => {
    const customColumns = getCustomAttributeColumns(rows);
    return [...COLUMNS, ...customColumns];
  }, []);

  return (
    <Paper>
      <GenericTableWithData<
        GetAdminConsolidatedWaitlistQuery,
        GetAdminConsolidatedWaitlistQueryVariables,
        Row
      >
        getColumnDefs={getColumnDefs}
        queryVariables={{}}
        queryDocument={GetAdminConsolidatedWaitlistDocument}
        pagePath='consolidatedWaitlist'
        noData='No clients'
        paginationItemName='client'
        // filters={filters}
        // rowLinkTo={(row) =>
        //   generateSafePath(ProjectDashboardRoutes.REFERRAL, {
        //     projectId: row.targetProjectId,
        //     referralId: row.id,
        //   })
        // }
        // rowActionTitle='View Referral'
        // rowSecondaryActionConfigs={rowSecondaryActions}
      />
    </Paper>
  );
};

export default ConsolidatedWaitlistTable;
