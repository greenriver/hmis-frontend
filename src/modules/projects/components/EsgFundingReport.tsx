import { Paper, Typography } from '@mui/material';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import Loading from '@/components/elements/Loading';
import GenericTable from '@/components/elements/table/GenericTable';
import PageTitle from '@/components/layout/PageTitle';
import PrintViewButton from '@/components/layout/PrintViewButton';
import NotFound from '@/components/pages/NotFound';
import useIsPrintView from '@/hooks/useIsPrintView';
import usePrintTrigger from '@/hooks/usePrintTrigger';
import useSafeParams from '@/hooks/useSafeParams';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import { formatCurrency, parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import {
  EsgFundingServiceFieldsFragment,
  useGetEsgFundingReportQuery,
  useGetReferralPostingQuery,
} from '@/types/gqlTypes';

const EsgFundingReport: React.FC = () => {
  const { referralPostingId } = useSafeParams<{ referralPostingId: string }>();
  const { data, loading, error } = useGetReferralPostingQuery({
    variables: { id: referralPostingId as any as string },
    fetchPolicy: 'network-only',
  });

  const isPrint = useIsPrintView();

  const clientIds = useMemo(
    () => data?.referralPosting?.householdMembers?.map((hm) => hm.client.id),
    [data]
  );

  const {
    data: reportData,
    loading: reportLoading,
    error: reportError,
  } = useGetEsgFundingReportQuery({
    variables: { clientIds: clientIds || [] },
    skip: isNil(clientIds),
  });

  const report = reportData?.esgFundingReport;

  usePrintTrigger({
    startReady: isPrint,
    hold: loading || reportLoading,
  });

  if (loading || reportLoading) {
    return <Loading />;
  }
  if (error || reportError) {
    return <ApolloErrorAlert error={error || reportError} />;
  }
  if (!report) {
    return <NotFound />;
  }

  const table = (
    <GenericTable<EsgFundingServiceFieldsFragment>
      tableContainerProps={
        isPrint ? { sx: { overflow: 'initial', width: 'auto' } } : undefined
      }
      rows={report.esgFundingServices}
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
            row.customDataElements?.find((e) => e.key === 'funding_source')
              ?.value?.valueString,
        },
        {
          header: 'Payment Type',
          render: (row) =>
            row.customDataElements?.find((e) => e.key === 'payment_type')?.value
              ?.valueString,
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
        title={<Typography variant='h3'>ESG Funding Report</Typography>}
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
export default EsgFundingReport;
