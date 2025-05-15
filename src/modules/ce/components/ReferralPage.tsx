import { Container, Divider, Stack, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import CommonButtonDrawer from '@/components/elements/CommonButtonDrawer';
import CommonMenuButton from '@/components/elements/CommonMenuButton';
import Loading from '@/components/elements/Loading';
import {
  ActivityIcon,
  ContactsIcon,
  ExpandMoreIcon,
  InfoIcon,
  NotesIcon,
  PersonIcon,
} from '@/components/elements/SemanticIcons';
import CommonStickyBar from '@/components/layout/CommonStickyBar';
import NotFound from '@/components/pages/NotFound';
import { useIsMobile } from '@/hooks/useIsMobile';
import useSafeParams from '@/hooks/useSafeParams';
import AssignContactsForm from '@/modules/ce/components/AssignContactsForm';
import ReferralStatusChip from '@/modules/ce/components/ReferralStatusChip';
import { ClientDashboardRoutes } from '@/routes/routes';
import {
  CeReferralFieldsFragment,
  useGetCeReferralQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {}

/**
 * Provides navigational context for a single Referral.
 * Uses react router outlet to render sub-pages.
 */
const ReferralPage: React.FC<Props> = ({}) => {
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
      {/* Apply 0 padding to the bar, so the divider can take up full height */}
      <CommonStickyBar sx={{ py: 0 }}>
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
            <Stack direction='row' alignItems='center' gap={1}>
              <Typography variant='h3' component='h1' display='inline-block'>
                {referral.opportunity.name}
              </Typography>
              {/* TODO - discuss menu contents. For now it is just View Client and even that is invisible for some users. Should we just leave this out until we have more actions to put here?*/}
              <CommonMenuButton
                Icon={ExpandMoreIcon}
                iconButton={true}
                title={'Referral Actions'}
                items={[
                  ...(referral.client
                    ? [
                        {
                          title: 'View Client',
                          key: 'client',
                          to: generateSafePath(ClientDashboardRoutes.PROFILE, {
                            clientId: referral.client.id,
                          }),
                        },
                      ]
                    : []),
                ]}
              />
            </Stack>
            <ReferralStatusChip status={referral.status} />
          </Stack>
          <Stack sx={{ py: 2 }} direction='row' alignItems='center' gap={1}>
            <CommonButtonDrawer title={'Client'} icon={<PersonIcon />} />
            <CommonButtonDrawer title={'Referral'} icon={<InfoIcon />} />
            {referral.swimlanes.length > 0 && (
              // If this referral has no swimlanes, hide the Contacts button. This will only happen if the referral also has no tasks
              <CommonButtonDrawer title={'Contacts'} icon={<ContactsIcon />}>
                <AssignContactsForm referral={referral} />
              </CommonButtonDrawer>
            )}
            <CommonButtonDrawer title={'Activity'} icon={<ActivityIcon />} />
            <CommonButtonDrawer title={'Notes'} icon={<NotesIcon />} />
          </Stack>
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
