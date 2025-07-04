import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import { Container, Stack, Typography } from '@mui/material';
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
import { useIsMobile } from '@/hooks/useIsMobile';
import useSafeParams from '@/hooks/useSafeParams';

import AssignContactsForm from '@/modules/ce/components/referral/AssignContactsForm';

import ReferralTimeline from '@/modules/ce/components/referral/ReferralTimeline';
import { clientNameFromRecordWithOptionalClient } from '@/modules/hmis/hmisUtil';
import { ProjectDashboardRoutes, Routes } from '@/routes/routes';
import {
  CeReferralFieldsFragment,
  ProjectAllFieldsFragment,
  useGetCeReferralQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  // Referral is sometimes, but not always, rendered in the context of a Project.
  project?: ProjectAllFieldsFragment;
}

/**
 * Provides navigational context for a single Referral.
 * Uses react router outlet to render sub-pages.
 */
const ReferralPage: React.FC<Props> = ({ project }) => {
  const { referralId } = useSafeParams() as { referralId: string };

  const {
    data: { ceReferral: referral } = {},
    loading,
    error,
  } = useGetCeReferralQuery({
    variables: {
      id: referralId,
    },
  });

  // Provide the referral in an outlet context so it can be accessed easily by sub-pages, like the Referral Step page
  const outletContext: ReferralContext | undefined = useMemo(() => {
    if (!referral) return undefined;

    // Depending on whether this referral is being rendered in the context of a Project or as "floating" referral,
    // the links used by the sub-pages will be different. Provide helpers for them here in the outlet contexts
    // so the sub-pages don't have to do any thinking about it.
    if (project) {
      return {
        referral,
        referralPath: generateSafePath(ProjectDashboardRoutes.REFERRAL_STEPS, {
          projectId: project.id,
          referralId: referral.id,
        }),
        unitPath: referral.opportunity.unit
          ? generateSafePath(ProjectDashboardRoutes.UNIT, {
              projectId: project.id,
              unitId: referral.opportunity.unit.id,
            })
          : undefined,
        generateReferralStepPath: (stepId: string) => {
          return generateSafePath(ProjectDashboardRoutes.REFERRAL_STEP, {
            projectId: project.id,
            referralId: referral.id,
            stepId: stepId,
          });
        },
      };
    }

    return {
      referral,
      referralPath: generateSafePath(Routes.REFERRAL_STEPS, {
        referralId: referral.id,
      }),
      generateReferralStepPath: (stepId: string) => {
        return generateSafePath(Routes.REFERRAL_STEP, {
          referralId: referral.id,
          stepId: stepId,
        });
      },
    };
  }, [referral, project]);

  const isMobile = useIsMobile();

  if (loading) return <Loading />;
  if (error) throw error;
  if (!referral) return <NotFound />;

  const showContactsDrawer =
    referral.swimlanes.length > 0 && project?.access?.canAssignReferralTasks;

  return (
    <>
      <CommonStickyBar
        // If in project context, leave more room above the sticky bar
        top={
          project
            ? STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT
            : STICKY_BAR_HEIGHT
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
                Referral for {clientNameFromRecordWithOptionalClient(referral)}
              </Typography>
            </Box>
            <Stack sx={{ py: 1 }} direction='row' alignItems='center' gap={0.5}>
              <CommonButtonDrawer
                title='Details'
                ButtonProps={{ startIcon: <FolderRoundedIcon /> }}
              >
                <ReferralDetailContent referral={referral} />
              </CommonButtonDrawer>
              {showContactsDrawer && (
                <CommonButtonDrawer
                  title='Contacts'
                  ButtonProps={{ startIcon: <ContactsIcon /> }}
                >
                  <AssignContactsForm
                    referral={referral}
                    projectId={project.id}
                  />
                </CommonButtonDrawer>
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
