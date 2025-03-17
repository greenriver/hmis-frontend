import { Paper, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import ButtonLink from '@/components/elements/ButtonLink';
import Loading from '@/components/elements/Loading';
import TableRowActions from '@/components/elements/table/TableRowActions';
import { BASE_ACTION_COLUMN_DEF } from '@/components/elements/table/tableRowActionUtil';
import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import NotFound from '@/components/pages/NotFound';
import useSafeParams from '@/hooks/useSafeParams';
import ActivateReferralButton from '@/modules/ce/components/ActivateReferralButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { ClientDashboardRoutes, ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeCandidateFieldsFragment,
  GetCeOpportunityCandidatesDocument,
  GetCeOpportunityCandidatesQuery,
  GetCeOpportunityCandidatesQueryVariables,
  useGetCeOpportunityQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const COLUMNS: ColumnDef<CeCandidateFieldsFragment>[] = [
  {
    header: 'ID',
    render: 'id',
    key: 'id',
  },
  {
    header: 'Client ID',
    render: (candidate) => candidate.client.id,
    key: 'clientId',
  },
];

interface Props {}
const Opportunity: React.FC<Props> = ({}) => {
  const { opportunityId, projectId } = useSafeParams() as {
    opportunityId: string;
    projectId: string;
  };

  const {
    data: { ceOpportunity: opportunity } = {},
    loading,
    error,
  } = useGetCeOpportunityQuery({
    variables: {
      id: opportunityId,
    },
  });

  const columns = useMemo(() => {
    return [
      ...COLUMNS,
      {
        ...BASE_ACTION_COLUMN_DEF,
        render: (row: CeCandidateFieldsFragment) => (
          <TableRowActions
            record={row}
            recordName={`ID ${row.id}`}
            primaryAction={
              <ActivateReferralButton
                opportunityId={opportunityId}
                candidate={row}
              />
            }
            menuActionConfigs={[
              {
                title: 'View Client',
                key: 'client',
                ariaLabel: `View Client, ${row.client.id}`,
                to: generateSafePath(ClientDashboardRoutes.PROFILE, {
                  clientId: row.client.id,
                }),
              },
            ]}
          />
        ),
      },
    ];
  }, [opportunityId]);

  if (loading) return <Loading />;
  if (!opportunity) return <NotFound />;
  if (error) throw error;

  if (opportunity.projectId !== projectId) {
    return <NotFound />;
  }

  const { activeReferral, acceptedReferral, name } = opportunity;

  return (
    <>
      <PageTitle title={`Opportunity ${name}`} />
      {!!(activeReferral || acceptedReferral) && (
        <ButtonLink
          to={generateSafePath(ProjectDashboardRoutes.REFERRAL_DETAILS, {
            projectId: projectId,
            opportunityId: opportunityId,
            referralId: activeReferral?.id || acceptedReferral?.id || '',
          })}
        >
          View Referral
        </ButtonLink>
      )}
      {!activeReferral && !acceptedReferral && (
        <Stack gap={2}>
          <Typography variant='h4' component='h2'>
            Candidates
          </Typography>
          <Paper>
            <GenericTableWithData<
              GetCeOpportunityCandidatesQuery,
              GetCeOpportunityCandidatesQueryVariables,
              CeCandidateFieldsFragment
            >
              columns={columns}
              queryVariables={{ opportunityId: opportunityId }}
              queryDocument={GetCeOpportunityCandidatesDocument}
              pagePath='ceOpportunity.candidates'
              paginationItemName='candidates'
            />
          </Paper>
        </Stack>
      )}
    </>
  );
};

export default Opportunity;
