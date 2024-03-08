import { omit } from 'lodash-es';
import { ReactNode, useCallback, useState } from 'react';
import { useBulkAssignMutations } from '../../hooks/useBulkAssignMutations';
import { ServicePeriod } from '../../types';
import AssignServiceButton from './AssignServiceButton';
import MultiAssignServiceButton from './MultiAssignServiceButton';
import NotCollectedText from '@/components/elements/NotCollectedText';
import RouterLink from '@/components/elements/RouterLink';
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
import { EnrollmentDashboardRoutes } from '@/routes/routes';
import {
  BulkServicesClientSearchDocument,
  BulkServicesClientSearchQuery,
  BulkServicesClientSearchQueryVariables,
  ClientSortOption,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  projectId: string;
  serviceTypeId: string;
  serviceTypeName: string;
  searchTerm?: string;
  serviceDate: Date;
  servicePeriod?: ServicePeriod;
  cocCode?: string;
  title: ReactNode;
}

type RowType = BulkServicesClientSearchQuery['clientSearch']['nodes'][0];

const BulkServicesTable: React.FC<Props> = ({
  projectId,
  serviceTypeId,
  serviceTypeName,
  serviceDate,
  searchTerm,
  servicePeriod,
  title,
  cocCode,
}) => {
  const { bulkAssign, bulkRemove, apolloError } = useBulkAssignMutations();
  const [anyRowsSelected, setAnyRowsSelected] = useState<boolean>(false);

  const getColumnDefs = useCallback(
    (_rows: RowType[], loading?: boolean) => {
      const notEnrolledText = (
        <NotCollectedText variant='inherit' color='text.disabled'>
          Not enrolled on {formatDateForDisplay(serviceDate, 'M/d')}
        </NotCollectedText>
      );
      return [
        { ...CLIENT_COLUMNS.id, header: 'ID' },
        CLIENT_COLUMNS.first,
        CLIENT_COLUMNS.last,
        CLIENT_COLUMNS.dobAge,
        {
          header: 'Entry Date',
          render: (row: RowType) => {
            if (!row.activeEnrollment) return notEnrolledText;

            return (
              <RouterLink
                to={generateSafePath(
                  EnrollmentDashboardRoutes.ENROLLMENT_OVERVIEW,
                  { clientId: row.id, enrollmentId: row.activeEnrollment.id }
                )}
                openInNew
              >
                {parseAndFormatDate(row.activeEnrollment.entryDate)}
              </RouterLink>
            );
          },
        },
        {
          header: `Last ${serviceTypeName} Date`,
          render: (row: RowType) => {
            if (!row.activeEnrollment) return notEnrolledText;

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
                cocCode={cocCode}
                tableLoading={loading}
                disabled={anyRowsSelected}
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
      cocCode,
      anyRowsSelected,
    ]
  );

  return (
    <SsnDobShowContextProvider>
      <GenericTableWithData<
        BulkServicesClientSearchQuery,
        BulkServicesClientSearchQueryVariables,
        RowType
      >
        // remount when default filters change
        key={JSON.stringify({ ...servicePeriod, serviceTypeId })}
        queryVariables={{
          textSearch: searchTerm || '',
          serviceTypeId: serviceTypeId,
          serviceDate: formatDateForGql(serviceDate) || '',
          projectId,
        }}
        loadingVariant='linear'
        selectable='checkbox'
        onChangeSelectedRowIds={(rows) => setAnyRowsSelected(rows.length > 0)}
        queryDocument={BulkServicesClientSearchDocument}
        pagePath='clientSearch'
        getColumnDefs={getColumnDefs}
        showFilters
        recordType='Client'
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
        defaultSortOption={
          searchTerm
            ? ClientSortOption.BestMatch
            : ClientSortOption.LastNameAToZ
        }
        EnhancedTableToolbarProps={{
          title,
          renderBulkAction: (_selectedClientIds, selectedRows) => {
            return (
              <MultiAssignServiceButton
                clients={selectedRows}
                dateProvided={serviceDate}
                projectId={projectId}
                serviceTypeId={serviceTypeId}
                cocCode={cocCode}
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
