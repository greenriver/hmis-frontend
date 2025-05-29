import { Container, Divider, Stack, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useMemo } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import CommonButtonDrawer from '@/components/elements/CommonButtonDrawer';
import Loading from '@/components/elements/Loading';
import {
  ActivityIcon,
  ContactsIcon,
  InfoIcon,
  NotesIcon,
  PersonIcon,
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
import ReferralStatusChip from '@/modules/ce/components/referral/ReferralStatusChip';
import { clientNameFromRecordWithOptionalClient } from '@/modules/hmis/hmisUtil';
import {
  CeReferralFieldsFragment,
  ProjectAllFieldsFragment,
  useGetCeReferralQuery,
} from '@/types/gqlTypes';

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

  const outletContext: ReferralContext | undefined = useMemo(
    () => (referral ? { referral } : undefined),
    [referral]
  );

  const isMobile = useIsMobile();

  if (loading) return <Loading />;
  if (error) throw error;
  if (!referral) return <NotFound />;

  return (
    <>
      <CommonStickyBar
        // If in project context, leave more room above the sticky bar
        top={
          project
            ? STICKY_BAR_HEIGHT + CONTEXT_HEADER_HEIGHT
            : STICKY_BAR_HEIGHT
        }
        // Apply 0 padding to the bar, so the divider can take up full height
        sx={{ py: 0 }}
      >
        <Stack
          divider={
            <Divider
              orientation={isMobile ? 'horizontal' : 'vertical'}
              flexItem
            />
          }
          direction={isMobile ? 'column' : 'row'}
          alignItems={isMobile ? '' : 'center'}
          gap={2}
        >
          <Stack
            sx={{ py: 2 }}
            flex={1}
            direction='row'
            alignItems='center'
            justifyContent='space-between'
          >
            <Box>
              <Typography variant='h3' component='h1'>
                Referral for {clientNameFromRecordWithOptionalClient(referral)}
              </Typography>
            </Box>
            <ReferralStatusChip status={referral.status} />
          </Stack>
          <Stack sx={{ py: 2 }} direction='row' alignItems='center' gap={1}>
            <CommonButtonDrawer
              title={'Client'}
              ButtonProps={{ startIcon: <PersonIcon /> }}
            />
            <CommonButtonDrawer
              title={'Referral'}
              ButtonProps={{ startIcon: <InfoIcon /> }}
            />
            {referral.swimlanes.length > 0 &&
              project &&
              project.access.canAssignReferralTasks && (
                // If this referral has no swimlanes, hide the Contacts button. This will only happen if the referral also has no tasks
                <CommonButtonDrawer
                  title={'Contacts'}
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
            />
            <CommonButtonDrawer
              title={'Notes'}
              ButtonProps={{ startIcon: <NotesIcon /> }}
            />
          </Stack>
        </Stack>
      </CommonStickyBar>
      <Container maxWidth='md' sx={{ py: 4 }}>
        <Outlet context={outletContext} />
      </Container>
    </>
  );
};

export type ReferralContext = { referral: CeReferralFieldsFragment };
export const useReferralContext = () => useOutletContext<ReferralContext>();

export default ReferralPage;
