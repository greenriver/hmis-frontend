import { ListRounded, RadioButtonUncheckedRounded } from '@mui/icons-material';
import Person from '@mui/icons-material/Person';
import { Container, Divider, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import ButtonLink from '@/components/elements/ButtonLink';
import Loading from '@/components/elements/Loading';
import { DetailsIcon } from '@/components/elements/SemanticIcons';
import CommonStickyBar from '@/components/layout/CommonStickyBar';
import {
  CONTEXT_HEADER_HEIGHT,
  REFERRAL_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import NotFound from '@/components/pages/NotFound';
import useCurrentPath from '@/hooks/useCurrentPath';
import useSafeParams from '@/hooks/useSafeParams';
import ReferralStatusChip from '@/modules/ce/components/ReferralStatusChip';
import { clientNameFromRecordWithOptionalClient } from '@/modules/hmis/hmisUtil';
import { ProjectDashboardRoutes } from '@/routes/routes';
import {
  CeReferralFieldsFragment,
  useGetCeReferralQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {}

/**
 * Provides navigational context for a single Referral, like buttons to move between tasks, notes/referral history, etc.
 * Uses react router outlet to render sub-pages.
 */
const ReferralPage: React.FC<Props> = ({}) => {
  const { projectId, opportunityId, referralId } = useSafeParams() as {
    projectId: string;
    opportunityId: string;
    referralId: string;
  };

  const {
    data: { ceReferral: referral } = {},
    loading,
    error,
  } = useGetCeReferralQuery({
    variables: {
      id: referralId,
    },
  });

  const outletContext: ReferralContext | undefined = useMemo(
    () => (referral ? { referral } : undefined),
    [referral]
  );

  const currentPath = useCurrentPath();

  if (loading) return <Loading />;
  if (error) throw error;
  if (!referral) return <NotFound />;

  return (
    <>
      <CommonStickyBar height={REFERRAL_HEADER_HEIGHT}>
        <Stack direction='column' gap={2}>
          <Stack
            direction='row'
            alignItems='center'
            justifyContent='space-between'
          >
            <Typography variant='h3' component='h1' display='inline-block'>
              Referral to {referral.opportunity.name}
            </Typography>
            <ReferralStatusChip status={referral.status} />
          </Stack>
          <Stack
            direction='row'
            gap={2}
            divider={<Divider orientation='vertical' flexItem />}
          >
            <Stack direction='row' alignItems='center' gap={0.5}>
              <Person sx={{ color: 'grayscale.main' }} />
              <Typography variant='body1'>
                {clientNameFromRecordWithOptionalClient(referral)}
              </Typography>
            </Stack>
            <Typography variant='body1'>
              {referral.opportunity.projectName}
            </Typography>
          </Stack>
        </Stack>
      </CommonStickyBar>
      <CommonStickyBar
        top={STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT + REFERRAL_HEADER_HEIGHT}
        sx={{ py: 1 }}
      >
        <Stack direction='row' alignItems='center' gap={1}>
          <ButtonLink
            to={generateSafePath(ProjectDashboardRoutes.REFERRAL_DETAILS, {
              projectId,
              opportunityId,
              referralId: referral.id,
            })}
            color='grayscale'
            variant={
              currentPath === '/referrals/:referralId' ? 'contained' : 'text'
            }
            startIcon={<DetailsIcon />}
          >
            Details
          </ButtonLink>
          <Divider orientation='vertical' flexItem />
          <ButtonLink
            to={generateSafePath(ProjectDashboardRoutes.REFERRAL_STEPS, {
              projectId,
              opportunityId,
              referralId: referral.id,
            })}
            color='grayscale'
            variant={
              currentPath === '/referrals/:referralId/tasks'
                ? 'contained'
                : 'text'
            }
            startIcon={<ListRounded />}
          >
            Tasks
          </ButtonLink>
          {referral.steps.map((step, i) => (
            <ButtonLink
              to={generateSafePath(ProjectDashboardRoutes.REFERRAL_STEP, {
                projectId,
                opportunityId,
                referralId: referral.id,
                stepId: step.stepId || '',
              })}
              aria-label={`Step ${i}`}
              variant='text'
              key={step.id}
            >
              {/* TODO(7393) - update these to show step status, disabled, selected state, etc.*/}
              <RadioButtonUncheckedRounded />
            </ButtonLink>
          ))}
        </Stack>
      </CommonStickyBar>
      <Container maxWidth='lg' sx={{ py: 4 }}>
        <Outlet context={outletContext} />
      </Container>
    </>
  );
};

export type ReferralContext = { referral: CeReferralFieldsFragment };
export const useReferralContext = () => useOutletContext<ReferralContext>();

export default ReferralPage;
