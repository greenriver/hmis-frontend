import { omit } from 'lodash-es';
import { ReactNode, useCallback } from 'react';
import { useBulkAssignMutations } from '../../hooks/useBulkAssignMutations';
import { ServicePeriod } from '../../types';
import AssignServiceButton from './AssignServiceButton';
import BulkAssignServicesButtons from './BulkAssignServicesButtons';
import NotCollectedText from '@/components/elements/NotCollectedText';
import { ColumnDef } from '@/components/elements/table/types';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import {
  formatDateForDisplay,
  formatDateForGql,
  formatRelativeDate,
  parseAndFormatDate,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { CLIENT_COLUMNS } from '@/modules/search/components/ClientSearch';
import {
  BulkServicesClientSearchDocument,
  BulkServicesClientSearchQuery,
  BulkServicesClientSearchQueryVariables,
  ClientSortOption,
} from '@/types/gqlTypes';

interface Props {
  projectId: string;
  serviceTypeId: string;
  serviceTypeName: string;
  searchTerm?: string;
  serviceDate: Date;
  servicePeriod?: ServicePeriod;
  title: ReactNode;
}

type RowType = BulkServicesClientSearchQuery['clientSearch']['nodes'][0];

const NaText = () => (
  <NotCollectedText variant='inherit' color='text.disabled'>
    N/A
  </NotCollectedText>
);

const BulkServicesTable: React.FC<Props> = ({
  projectId,
  serviceTypeId,
  serviceTypeName,
  serviceDate,
  searchTerm,
  servicePeriod,
  title,
}) => {
  const { bulkAssign, bulkRemove, apolloError } = useBulkAssignMutations();

  const getColumnDefs = useCallback(
    (_rows: RowType[], loading?: boolean) => {
      return [
        // CLIENT_COLUMNS.id,
        CLIENT_COLUMNS.first,
        CLIENT_COLUMNS.last,
        CLIENT_COLUMNS.dobAge,
        {
          header: 'Entry Date',
          render: (row: RowType) =>
            parseAndFormatDate(row.activeEnrollment?.entryDate) || <NaText />,
        },
        {
          header: `Last ${serviceTypeName} Date`,
          render: (row: RowType) => {
            if (!row.activeEnrollment) return <NaText />;

            const noService = (
              <NotCollectedText variant='inherit' color='text.disabled'>
                No Previous {serviceTypeName}
              </NotCollectedText>
            );
            if (!row.activeEnrollment.lastServiceDate) {
              return noService;
            }
            const dt = parseHmisDateString(
              row.activeEnrollment.lastServiceDate
            );
            if (!dt) return noService;
            const relative = formatRelativeDate(dt);
            const formatted = formatDateForDisplay(dt);
            return `${relative} (${formatted})`;
          },
        },
        {
          header: `Assign ${serviceTypeName} for ${formatDateForDisplay(
            serviceDate
          )}`,
          width: '180px',
          render: (row: RowType) => {
            return (
              <AssignServiceButton
                client={row}
                dateProvided={serviceDate}
                projectId={projectId}
                serviceTypeId={serviceTypeId}
                bulkAssign={bulkAssign}
                bulkRemove={bulkRemove}
                tableLoading={loading}
              />
            );
          },
        },
      ] as ColumnDef<RowType>[];
    },
    [
      serviceTypeName,
      serviceDate,
      projectId,
      serviceTypeId,
      bulkAssign,
      bulkRemove,
    ]
  );

  return (
    <SsnDobShowContextProvider>
      <GenericTableWithData<
        BulkServicesClientSearchQuery,
        BulkServicesClientSearchQueryVariables,
        RowType
      >
        // re-render when default filters change
        key={JSON.stringify(servicePeriod || '')}
        queryVariables={{
          textSearch: searchTerm || '',
          serviceTypeId: serviceTypeId,
          serviceDate: formatDateForGql(serviceDate) || '',
          projectId,
        }}
        selectable='checkbox'
        queryDocument={BulkServicesClientSearchDocument}
        pagePath='clientSearch'
        getColumnDefs={getColumnDefs}
        showFilters
        recordType='Client'
        // TODO: default sort by last name if showing by-list view?
        defaultFilters={
          // If "service period" is selected, filter down Client results to
          // only clients who received this service within the specified date range.
          servicePeriod
            ? {
                serviceInRange: {
                  startDate: formatDateForGql(servicePeriod.start) || '',
                  endDate: formatDateForGql(servicePeriod.end) || '',
                  serviceType: serviceTypeId,
                  projectId,
                },
              }
            : undefined
        }
        filters={(f) => omit(f, 'project', 'organization')}
        filterInputType='ClientFilterOptions'
        defaultSortOption={ClientSortOption.BestMatch}
        EnhancedTableToolbarProps={{
          title,
          renderBulkAction: (_selectedClientIds, selectedRows) => {
            return (
              <BulkAssignServicesButtons
                clients={selectedRows}
                dateProvided={serviceDate}
                projectId={projectId}
                serviceTypeId={serviceTypeId}
                bulkAssign={bulkAssign}
                bulkRemove={bulkRemove}
              />
            );
          },
        }}
      />
      {apolloError && <ApolloErrorAlert error={apolloError} />}
    </SsnDobShowContextProvider>
  );
};

export default BulkServicesTable;
