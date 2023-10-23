import { ApolloError } from '@apollo/client';
import { Paper, Typography } from '@mui/material';
import { isNil } from 'lodash-es';

import Loading from '@/components/elements/Loading';
import GenericTable from '@/components/elements/table/GenericTable';
import PageTitle from '@/components/layout/PageTitle';
import PrintViewButton from '@/components/layout/PrintViewButton';
import NotFound from '@/components/pages/NotFound';
import useIsPrintView from '@/hooks/useIsPrintView';
import usePrintTrigger from '@/hooks/usePrintTrigger';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import {
  customDataElementValueForKey,
  formatCurrency,
  parseAndFormatDate,
} from '@/modules/hmis/hmisUtil';
import {
  EsgFundingServiceFieldsFragment,
  useGetEsgFundingReportQuery,
} from '@/types/gqlTypes';

const EsgFundingReportContent: React.FC<{
  clientIds?: string[];
  loading?: boolean;
  error?: ApolloError;
}> = ({ clientIds = [], loading, error }) => {
  const isPrint = useIsPrintView();

  const {
    data: reportData,
    loading: reportLoading,
    error: reportError,
  } = useGetEsgFundingReportQuery({
    variables: { clientIds: clientIds || [] },
    skip: isNil(clientIds),
    fetchPolicy: 'cache-and-network',
  });

  const report = reportData?.esgFundingReport;

  usePrintTrigger({
    startReady: isPrint,
    hold: loading || reportLoading,
  });

  if (loading || (reportLoading && !report)) {
    return <Loading />;
  }
  if (error || reportError) {
    return <ApolloErrorAlert error={error || reportError} inline />;
  }
  if (!report) {
    return <NotFound />;
  }

  const verticalBorder = {
    borderRight: '1px solid white',
    borderColor: 'borders.light',
  };

  const table = (
    <GenericTable<EsgFundingServiceFieldsFragment>
      tableContainerProps={
        isPrint ? { sx: { overflow: 'initial', width: 'auto' } } : undefined
      }
      tableProps={{ sx: { td: verticalBorder, th: verticalBorder } }}
      rows={report}
      noData={
        <Typography color='textSecondary'>
          No ESG Funding Assistance services for this household
        </Typography>
      }
      columns={[
        {
          header: 'Last Name',
          render: (row) => row.lastName,
        },
        {
          header: 'First Name',
          render: (row) => row.firstName,
        },
        {
          header: 'Date Of Birth',
          render: (row) => parseAndFormatDate(row.clientDob),
        },
        {
          header: 'MCI ID',
          render: (row) => row.mciIds.map((id) => id.identifier).join('\n'),
        },
        {
          header: 'Provider ID',
          render: (row) => row.organizationId,
        },
        {
          header: 'Provider Name',
          render: (row) => row.organizationName,
        },
        {
          header: 'Program ID',
          render: (row) => row.projectId,
        },
        {
          header: 'Program Name',
          render: (row) => row.projectName,
        },
        {
          header: 'Funding Source',
          render: (row) =>
            customDataElementValueForKey(
              'funding_source',
              row.customDataElements
            ),
        },
        {
          header: 'Payment Type',
          render: (row) =>
            customDataElementValueForKey(
              'payment_type',
              row.customDataElements
            ),
        },
        {
          header: 'Amount',
          render: (row) => formatCurrency(row.faAmount),
        },
        {
          header: 'Payment Start Date',
          render: (row) => parseAndFormatDate(row.faStartDate),
        },
        {
          header: 'Payment End Date',
          render: (row) => parseAndFormatDate(row.faEndDate),
        },
      ]}
    />
  );

  return (
    <>
      <PageTitle
        title='ESG Funding Report'
        actions={
          !isPrint && (
            <PrintViewButton color='secondary' variant='outlined'>
              Print Report
            </PrintViewButton>
          )
        }
      />
      {isPrint ? table : <Paper>{table}</Paper>}
    </>
  );
};
export default EsgFundingReportContent;
