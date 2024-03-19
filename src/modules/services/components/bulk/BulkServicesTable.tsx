import { omit } from 'lodash-es';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { ServicePeriod } from '../../types';
import AssignServiceButton from './AssignServiceButton';
import MultiAssignServiceButton from './MultiAssignServiceButton';
import NotCollectedText from '@/components/elements/NotCollectedText';
import RouterLink from '@/components/elements/RouterLink';
import { ColumnDef } from '@/components/elements/table/types';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
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
  const [anyRowsSelected, setAnyRowsSelected] = useState<boolean>(false);

  const mutationQueryVariables = useMemo(
    () => ({
      projectId,
      dateProvided: formatDateForGql(serviceDate) || '',
      serviceTypeId,
      cocCode,
    }),
    [cocCode, projectId, serviceDate, serviceTypeId]
  );

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
                queryVariables={mutationQueryVariables}
                tableLoading={loading}
                disabled={anyRowsSelected}
                disabledReason={
                  anyRowsSelected
                    ? 'Deselect checkboxes to assign clients individually.'
                    : undefined
                }
              />
            );
          },
        },
      ] as ColumnDef<RowType>[];
    },
    [serviceDate, serviceTypeName, mutationQueryVariables, anyRowsSelected]
  );

  const defaultFilters = useMemo(() => {
    if (!servicePeriod) return;

    // If "service period" is selected, filter down Client results to
    // only clients who received this service within the specified date range.
    // This is a "default filter" because it's not specified by the user.
    return {
      serviceInRange: {
        startDate: formatDateForGql(servicePeriod.start) || '',
        endDate: formatDateForGql(servicePeriod.end) || '',
        serviceType: serviceTypeId,
        projectId,
      },
    };
  }, [projectId, servicePeriod, serviceTypeId]);

  return (
    <SsnDobShowContextProvider>
      <GenericTableWithData<
        BulkServicesClientSearchQuery,
        BulkServicesClientSearchQueryVariables,
        RowType
      >
        // remount when defaultFilters change
        key={JSON.stringify(defaultFilters)}
        queryVariables={{
          textSearch: searchTerm || '',
          serviceTypeId,
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
        defaultFilters={defaultFilters}
        // TODO: add user-facing filter options for enrolled clients and bed night date. No filter options for now.
        filters={(f) => omit(f, 'project', 'organization')}
        filterInputType='ClientFilterOptions'
        defaultSortOption={
          searchTerm
            ? ClientSortOption.BestMatch
            : ClientSortOption.LastNameAToZ
        }
        EnhancedTableToolbarProps={{
          title,
          renderBulkAction: (_selectedClientIds, selectedRows) => (
            <MultiAssignServiceButton
              clients={selectedRows}
              queryVariables={mutationQueryVariables}
            />
          ),
        }}
      />
    </SsnDobShowContextProvider>
  );
};

export default BulkServicesTable;
