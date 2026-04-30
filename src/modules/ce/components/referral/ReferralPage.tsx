import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import { Badge, Container, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useMemo } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import ReferralDetailContent from './ReferralDetailContent';
import CommonButtonDrawer from '@/components/elements/CommonButtonDrawer';
import Loading from '@/components/elements/Loading';
import {
  ActivityIcon,
  ContactsIcon,
} from '@/components/elements/SemanticIcons';
import CommonStickyBar from '@/components/layout/CommonStickyBar';
import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import NotFound from '@/components/pages/NotFound';
import useCurrentPath from '@/hooks/useCurrentPath';
import { useIsMobile } from '@/hooks/useIsMobile';
import useSafeParams from '@/hooks/useSafeParams';

import AssignContactsForm from '@/modules/ce/components/referral/AssignContactsForm';

import ReferralTimeline from '@/modules/ce/components/referral/ReferralTimeline';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { ProjectDashboardRoutes, ReferralRoutes } from '@/routes/routes';
import {
  CeReferralFieldsFragment,
  useGetCeReferralQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

const getReferralPaths = (currentPath: string) => {
  switch (currentPath) {
    case ProjectDashboardRoutes.REFERRAL: {
      return [
        ProjectDashboardRoutes.REFERRAL,
        ProjectDashboardRoutes.REFERRAL_STEP,
      ];
    }
    case ReferralRoutes.REFERRAL: {
      return [ReferralRoutes.REFERRAL, ReferralRoutes.REFERRAL_STEP];
    }
    default: {
      throw new Error(`unexpected path rendered ReferralPage: ${currentPath}`);
    }
  }
};

interface Props {}

/**
 * Provides navigational context for a single Referral.
 * Uses react router outlet to render sub-pages.
 *
 * This page is rendered in multiple contexts:
 * - In the Project Dashboard - either Source or Target project
 * - "Floating" at `/referrals/:referralId` (top-level referrals area)
 */
const ReferralPage: React.FC<Props> = ({}) => {
  const { referralId } = useSafeParams() as { referralId: string };

  // Referral is sometimes, but not always, rendered in the context of a Project.
  const { project } = useProjectDashboardContext();

  const {
    data: { ceReferral: referral } = {},
    loading,
    error,
  } = useGetCeReferralQuery({
    variables: {
      id: referralId,
    },
  });
  const currentPath = useCurrentPath();
  const currentBasePath = currentPath?.replace(/(:referralId).*$/, '$1'); // drop everything after :referralId

  // Provide the referral in an outlet context so it can be accessed easily by sub-pages, like the Referral Step page
  const outletContext: ReferralContext | undefined = useMemo(() => {
    if (!referral) return;
    if (!currentBasePath) return;

    // Depending on whether this referral is being rendered in the context of a Project or as "floating" referral,
    // the links used by the sub-pages will be different. Provide helpers for them here in the outlet contexts
    // so the sub-pages don't have to do any thinking about it.
    const [referralPath, referralStepPath] = getReferralPaths(currentBasePath);
    return {
      referral,
      referralPath: generateSafePath(referralPath, {
        referralId: referral.id,
        projectId: project?.id,
      }),
      generateReferralStepPath: (stepId: string) =>
        generateSafePath(referralStepPath, {
          referralId: referral.id,
          stepId: stepId,
          projectId: project?.id,
        }),
    };
  }, [referral, currentBasePath, project?.id]);

  const isMobile = useIsMobile();

  if (loading) return <Loading />;
  if (error) throw error;
  if (!referral) return <NotFound />;

  const showContactsDrawer =
    referral.swimlanes &&
    referral.swimlanes.length > 0 &&
    referral.access.canAssignReferralTasks;

  const unassignedSwimlanesCount = referral.swimlanes?.filter(
    (s) => s.participants.length === 0
  ).length;

  return (
    <>
      <CommonStickyBar
        top={
          currentBasePath === ReferralRoutes.REFERRAL
            ? STICKY_BAR_HEIGHT // Floating context doesn't need additional height for sticky scroll
            : STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT // Project dashboard contexts do
        }
        sx={{ pb: 0, pt: isMobile ? 1 : 0 }}
      >
        <Container maxWidth='md'>
          <Stack
            direction={isMobile ? 'column' : 'row'}
            alignItems={isMobile ? '' : 'center'}
            columnGap={2}
            rowGap={0}
            justifyContent='space-between'
          >
            <Box sx={{ overflow: 'hidden', textWrap: 'nowrap' }}>
              <Typography
                variant='h5'
                component='h1'
                sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}
              >
                Referral for {referral.clientName}
              </Typography>
            </Box>
            <Stack sx={{ py: 1 }} direction='row' alignItems='center' gap={0.5}>
              <CommonButtonDrawer
                title='Details'
                ButtonProps={{ startIcon: <FolderRoundedIcon /> }}
              >
                <ReferralDetailContent
                  referral={referral}
                  // Link to target project if rendered outside target project's context
                  linkToProject={
                    !project || project.id !== referral.targetProjectId
                  }
                />
              </CommonButtonDrawer>
              {showContactsDrawer && (
                // MUI badge auto-hides when count is 0
                <Badge badgeContent={unassignedSwimlanesCount}>
                  <CommonButtonDrawer
                    title='Contacts'
                    ButtonProps={{ startIcon: <ContactsIcon /> }}
                  >
                    <AssignContactsForm
                      referral={referral}
                      projectId={referral.targetProjectId}
                    />
                  </CommonButtonDrawer>
                </Badge>
              )}
              <CommonButtonDrawer
                title={'Activity'}
                ButtonProps={{ startIcon: <ActivityIcon /> }}
              >
                <ReferralTimeline referral={referral} />
              </CommonButtonDrawer>
            </Stack>
          </Stack>
        </Container>
      </CommonStickyBar>
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Outlet context={outletContext} />
      </Container>
    </>
  );
};

export type ReferralContext = {
  referral: CeReferralFieldsFragment;
  referralPath: string;
  unitPath?: string;
  generateReferralStepPath: (stepId: string) => string;
};
export const useReferralContext = () => useOutletContext<ReferralContext>();

export default ReferralPage;
