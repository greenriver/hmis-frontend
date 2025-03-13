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
          key: 'lastName',
          render: (row) => row.lastName,
        },
        {
          header: 'First Name',
          key: 'firstName',
          render: (row) => row.firstName,
        },
        {
          header: 'Date Of Birth',
          key: 'dob',
          render: (row) => parseAndFormatDate(row.clientDob),
        },
        {
          header: 'MCI ID',
          key: 'mciId',
          render: (row) => row.mciIds.map((id) => id.identifier).join('\n'),
        },
        {
          header: 'Provider ID',
          key: 'providerId',
          render: (row) => row.organizationId,
        },
        {
          header: 'Provider Name',
          key: 'providerName',
          render: (row) => row.organizationName,
        },
        {
          header: 'Program ID',
          key: 'programId',
          render: (row) => row.projectId,
        },
        {
          header: 'Program Name',
          key: 'programName',
          render: (row) => row.projectName,
        },
        {
          header: 'Funding Source',
          key: 'fundingSource',
          render: (row) =>
            customDataElementValueForKey(
              'funding_source',
              row.customDataElements
            ),
        },
        {
          header: 'Payment Type',
          key: 'paymentType',
          render: (row) =>
            customDataElementValueForKey(
              'payment_type',
              row.customDataElements
            ),
        },
        {
          header: 'Amount',
          key: 'amount',
          render: (row) => formatCurrency(row.faAmount),
        },
        {
          header: 'Payment Start Date',
          key: 'paymentStartDate',
          render: (row) => parseAndFormatDate(row.faStartDate),
        },
        {
          header: 'Payment End Date',
          key: 'paymentEndDate',
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
            <PrintViewButton variant='outlined'>Print Report</PrintViewButton>
          )
        }
      />
      {isPrint ? table : <Paper>{table}</Paper>}
    </>
  );
};
export default EsgFundingReportContent;
