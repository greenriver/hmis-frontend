import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import { Badge, Container, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';

import ReferralDetailContent from './ReferralDetailContent';
import { ReferralContext } from './referralOutletContext';
import CommonButtonDrawer from '@/components/elements/CommonButtonDrawer';
import {
  ActivityIcon,
  ContactsIcon,
} from '@/components/elements/SemanticIcons';
import CommonStickyBar from '@/components/layout/CommonStickyBar';
import {
  CONTEXT_HEADER_HEIGHT,
  STICKY_BAR_HEIGHT,
} from '@/components/layout/layoutConstants';
import { useIsMobile } from '@/hooks/useIsMobile';
import AssignContactsForm from '@/modules/ce/components/referral/AssignContactsForm';
import ReferralTimeline from '@/modules/ce/components/referral/ReferralTimeline';
import { LocationState } from '@/routes/routeUtil';
import { CeReferralFieldsFragment } from '@/types/gqlTypes';

export interface ReferralContentProps {
  referral: CeReferralFieldsFragment;
  referralPath: string;
  generateReferralStepPath: (stepId: string) => string;
  referralRouteState?: LocationState;
  overrideStepTitle?: (name: string | undefined) => void;
  linkToProject: boolean;
}

/**
 * Renders a single Referral. Uses react router outlet to render sub-pages (steps).
 *
 * Can be rendered in the Project context or in the Referral context.
 */
const ReferralContent: React.FC<ReferralContentProps> = ({
  referral,
  referralPath,
  generateReferralStepPath,
  referralRouteState,
  overrideStepTitle,
  linkToProject,
}) => {
  const outletContext: ReferralContext = useMemo(
    () => ({
      referral,
      referralPath,
      generateReferralStepPath,
      referralRouteState,
      overrideStepTitle,
    }),
    [
      referral,
      referralPath,
      generateReferralStepPath,
      referralRouteState,
      overrideStepTitle,
    ]
  );

  const isMobile = useIsMobile();

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
        top={STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT}
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
                  linkToProject={linkToProject}
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

export default ReferralContent;
