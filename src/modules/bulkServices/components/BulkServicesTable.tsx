import { Box } from '@mui/material';
import { ReactNode, useCallback, useMemo, useState } from 'react';
import { ServicePeriod } from '../bulkServicesTypes';
import AssignServiceButton from './AssignServiceButton';
import MultiAssignServiceButton from './MultiAssignServiceButton';
import NotCollectedText from '@/components/elements/NotCollectedText';
import TableRowActions from '@/components/elements/table/TableRowActions';
import {
  BASE_ACTION_COLUMN_DEF,
  getViewClientMenuItem,
  getViewEnrollmentMenuItem,
} from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import { useIsMobile } from '@/hooks/useIsMobile';
import { SsnDobShowContextProvider } from '@/modules/client/providers/ClientSsnDobVisibility';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import {
  clientBriefName,
  formatDateForDisplay,
  formatDateForGql,
  formatRelativeDate,
  parseAndFormatDate,
  parseHmisDateString,
} from '@/modules/hmis/hmisUtil';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
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
  cocCode?: string;
  title: ReactNode;
  onCompleted: (data: BulkServicesClientSearchQuery) => void;
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
  onCompleted,
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

  const [canViewDob] = useHasRootPermissions(['canViewDob']);

  const isTiny = useIsMobile('sm');

  const getColumnDefs = useCallback(
    (_rows: RowType[], loading?: boolean) => {
      const notEnrolledText = (
        <NotCollectedText variant='inherit' color='grayscale.main'>
          Not enrolled on {formatDateForDisplay(serviceDate, 'M/d')}
        </NotCollectedText>
      );
      return [
        { ...CLIENT_COLUMNS.name, sticky: 'left' },
        ...(canViewDob ? [CLIENT_COLUMNS.dobAge] : []),
        {
          header: 'Entry Date',
          key: 'entryDate',
          render: (row: RowType) => {
            if (!row.activeEnrollment) return notEnrolledText;

            return parseAndFormatDate(row.activeEnrollment.entryDate);
          },
        },
        {
          header: `Last ${serviceTypeName} Date`,
          key: 'lastServiceDate',
          render: (row: RowType) => {
            if (!row.activeEnrollment) return notEnrolledText;

            const noService = (
              <NotCollectedText variant='inherit' color='grayscale.main'>
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
          ...BASE_ACTION_COLUMN_DEF,
          width: '180px',
          tableCellProps: { sx: { p: 1, pl: 2 } },
          // Prevent stickiness on tiny screens, so that non-sticky columns are still scrollable
          sticky: isTiny ? undefined : 'right',
          render: (row: RowType) => (
            <TableRowActions
              record={row}
              recordName={clientBriefName(row)}
              primaryAction={
                <Box sx={{ width: '100%' }}>
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
                    serviceTypeName={serviceTypeName}
                  />
                </Box>
              }
              menuActionConfigs={[
                getViewClientMenuItem(row),
                ...(row.activeEnrollment
                  ? [getViewEnrollmentMenuItem(row.activeEnrollment, row)]
                  : []),
              ]}
            />
          ),
        },
      ] as ColumnDef<RowType>[];
    },
    [
      anyRowsSelected,
      canViewDob,
      isTiny,
      mutationQueryVariables,
      serviceDate,
      serviceTypeName,
    ]
  );

  const defaultFilterValues = useMemo(() => {
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

  const handleSelectedRowsChange = useCallback(
    (rows: readonly string[]) => setAnyRowsSelected(rows.length > 0),
    []
  );

  return (
    <SsnDobShowContextProvider>
      <GenericTableWithData<
        BulkServicesClientSearchQuery,
        BulkServicesClientSearchQueryVariables,
        RowType
      >
        // remount when defaultFilterValues change
        key={JSON.stringify(defaultFilterValues)}
        queryVariables={{
          textSearch: searchTerm || '',
          serviceTypeId,
          serviceDate: formatDateForGql(serviceDate) || '',
          projectId,
        }}
        loadingVariant='linear'
        selectable='checkbox'
        onChangeSelectedRowIds={handleSelectedRowsChange}
        queryDocument={BulkServicesClientSearchDocument}
        pagePath='clientSearch'
        getColumnDefs={getColumnDefs}
        recordType='Client'
        // TODO: add user-facing filter options for enrolled clients and bed night date. No filter options for now.
        defaultFilterValues={defaultFilterValues}
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
        onCompleted={onCompleted}
      />
    </SsnDobShowContextProvider>
  );
};

export default BulkServicesTable;
