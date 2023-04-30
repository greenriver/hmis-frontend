import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import {
  Box,
  BoxProps,
  Card,
  Chip,
  Grid,
  Link,
  Skeleton,
  Stack,
  SxProps,
  Typography,
} from '@mui/material';
import { fromPairs } from 'lodash-es';
import { useCallback, useRef, useState } from 'react';

import ButtonLink from '@/components/elements/ButtonLink';
import ExternalIdDisplay from '@/components/elements/ExternalIdDisplay';
import ClientImageUploadDialog from '@/components/elements/input/ClientImageUploadDialog';
import NotSpecified from '@/components/elements/NotSpecified';
import RouterLink from '@/components/elements/RouterLink';
import SimpleAccordion from '@/components/elements/SimpleAccordion';
import SimpleTable from '@/components/elements/SimpleTable';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import { ClientSafeSsn } from '@/modules/hmis/components/ClientSsn';
import HmisEnum, { MultiHmisEnum } from '@/modules/hmis/components/HmisEnum';
import {
  clientNameWithoutPreferred,
  lastUpdated,
  pronouns,
} from '@/modules/hmis/hmisUtil';
import { RootPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { ClientDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  ClientFieldsFragment,
  ClientImageFragment,
  Gender,
  useGetClientImageQuery,
} from '@/types/gqlTypes';
import generateSafePath from '@/utils/generateSafePath';

interface Props {
  client: ClientFieldsFragment;
  onlyCard?: boolean;
}

export const ClientProfileCardTextTable = ({
  content,
}: {
  content: Record<string, React.ReactNode>;
}) => {
  return (
    <SimpleTable
      TableCellProps={{
        sx: {
          borderBottom: 0,
          py: 0.5,
          px: 1,
          '&:first-of-type': {
            pl: 0,
            pr: 2,
            width: '1px',
            whiteSpace: 'nowrap',
            verticalAlign: 'baseline',
          },
        },
      }}
      columns={[
        {
          name: 'key',
          render: (row) => (
            <strong style={{ fontWeight: 600 }}>{row.id}</strong>
          ),
        },
        { name: 'value', render: (row) => row.value },
      ]}
      rows={Object.entries(content).map(([id, value]) => ({ id, value }))}
    />
  );
};

export const ClientProfileCardAccordion = ({ client }: Props): JSX.Element => {
  return (
    <Box
      sx={{
        '& .MuiAccordion-root:first-of-type': {
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        },
      }}
    >
      <SimpleAccordion
        renderHeader={(header) => <Typography>{header}</Typography>}
        renderContent={(content) => content}
        AccordionProps={{
          sx: { '&.MuiAccordion-root': { my: 0 } },
        }}
        items={[
          {
            key: 'IDs',
            content: (
              <ClientProfileCardTextTable
                content={fromPairs(
                  client.externalIds.map((externalId) => {
                    return [
                      externalId.label,
                      <ExternalIdDisplay value={externalId} />,
                    ];
                  })
                )}
              />
            ),
          },
          {
            key: 'Demographics',
            defaultExpanded: true,
            content: (
              <ClientProfileCardTextTable
                content={{
                  Race: (
                    <MultiHmisEnum
                      values={client.race}
                      enumMap={HmisEnums.Race}
                      oneRowPerValue
                    />
                  ),
                  Ethnicity: (
                    <HmisEnum
                      value={client.ethnicity}
                      enumMap={HmisEnums.Ethnicity}
                    />
                  ),
                  Gender: (
                    <MultiHmisEnum
                      values={client.gender}
                      enumMap={{
                        ...HmisEnums.Gender,
                        [Gender.NoSingleGender]: 'Non-Binary',
                      }}
                    />
                  ),
                  Pronouns: pronouns(client) || <NotSpecified />,
                  'Veteran Status': (
                    <HmisEnum
                      value={client.veteranStatus}
                      enumMap={HmisEnums.NoYesReasonsForMissingData}
                    />
                  ),
                }}
              />
            ),
          },
          // {
          //   key: 'Case Manager',
          //   content: 'TK',
          // },
          // {
          //   key: 'Housing Status',
          //   content: 'TK',
          // },
          // {
          //   key: 'Client Contact Information',
          //   content: 'TK',
          // },
        ]}
      />
    </Box>
  );
};

export const ClientCardImageElement = ({
  client,
  base64,
  url,
  size = 150,
  ...props
}: {
  client?: ClientImageFragment;
  base64?: string;
  url?: string;
  size?: number;
} & BoxProps<'img'>) => {
  // let src = 'https://dummyimage.com/150x150/e8e8e8/aaa';
  let src;

  if (client?.image?.base64)
    src = `data:image/jpeg;base64,${client.image.base64}`;
  if (base64) src = `data:image/jpeg;base64,${base64}`;
  if (url) src = url;

  return (
    <Box
      alt='client'
      src={src}
      {...props}
      sx={{
        height: size,
        width: size,
        backgroundColor: (theme) => theme.palette.grey[100],
        borderRadius: (theme) => `${theme.shape.borderRadius}px`,
        ...props.sx,
      }}
      component={src ? 'img' : undefined}
    >
      {src ? undefined : (
        <Typography
          sx={{
            color: (theme) => theme.palette.text.disabled,
            borderBottom: 0,
            display: 'flex',
            flexGrow: 1,
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          variant='body2'
          component='span'
        >
          No Client Photo
        </Typography>
      )}
    </Box>
  );
};

export const ClientCardImage = ({
  client,
  size = 150,
}: {
  client?: ClientImageFragment;
  size?: number;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const linkRef = useRef<HTMLButtonElement | null>(null);

  const handleClose = useCallback(() => {
    setOpen(false);
    // Without this the overlay will continue to show after the modal is closed
    setTimeout(() => linkRef.current?.blur());
  }, []);
  const handleOpen = useCallback(() => setOpen(true), []);

  if (!client) return <ClientCardImageElement />;

  const overlaySx: SxProps = {
    opacity: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    inset: 0,
    transition: 'opacity 0.2s',
    pointerEvents: 'none',
  };

  return (
    <>
      <ClientImageUploadDialog
        open={open}
        onClose={handleClose}
        clientId={client.id}
      />
      <Link
        component='button'
        underline='none'
        onClick={handleOpen}
        ref={linkRef}
        sx={{
          position: 'relative',
          width: size,
          height: size,
          '&:focus-within > .overlay': {
            opacity: 1,
          },
          '&:hover > .overlay': {
            opacity: 1,
          },
        }}
      >
        <ClientCardImageElement size={size} client={client} />
        {client.image?.base64 ? (
          // Has photo
          <Box
            className='overlay'
            sx={{
              ...overlaySx,
              backgroundColor: 'rgba(0,0,0, 0.5)',
            }}
          >
            <Chip
              label='Update Photo'
              icon={<EditIcon />}
              sx={{
                backgroundColor: (theme) => theme.palette.grey[200],
              }}
            />
          </Box>
        ) : (
          // No photo
          <Box
            className='overlay'
            sx={{
              ...overlaySx,
              backgroundColor: (theme) => theme.palette.grey[100],
            }}
          >
            <Chip label='Add Client Photo' icon={<PhotoCameraIcon />} />
          </Box>
        )}
      </Link>
    </>
  );
};

const ClientProfileCard: React.FC<Props> = ({ client, onlyCard = false }) => {
  const {
    data: { client: clientImageData } = {},
    loading: imageLoading = false,
  } = useGetClientImageQuery({
    variables: { id: client.id },
  });
  const primaryName =
    client.preferredName || clientNameWithoutPreferred(client);
  const secondaryName = client.preferredName
    ? clientNameWithoutPreferred(client)
    : null;

  const [canViewSsn] = useHasRootPermissions([
    'canViewFullSsn',
    'canViewPartialSsn',
  ]);

  return (
    <>
      <Card
        sx={{
          p: 2,
          ...(!onlyCard
            ? { borderBottomRightRadius: 0, borderBottomLeftRadius: 0 }
            : {}),
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h4'>{primaryName}</Typography>
            {secondaryName && (
              <Typography color='GrayText'>
                <em>{secondaryName}</em>
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
            {imageLoading ? (
              <Skeleton
                variant='rectangular'
                sx={{
                  height: 150,
                  width: 150,
                  mr: 1,
                }}
              />
            ) : (
              <ClientCardImage
                size={175}
                client={clientImageData || undefined}
              />
            )}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <ClientProfileCardTextTable
                content={{
                  ...(pronouns(client)
                    ? { Pronouns: pronouns(client) }
                    : undefined),
                  Age: (
                    <ClientDobAge client={client} noValue={<NotSpecified />} />
                  ),
                  ...(canViewSsn
                    ? {
                        SSN: <ClientSafeSsn client={client} />,
                      }
                    : {}),
                }}
              />
              <Stack sx={{ flexGrow: 1, maxWidth: '300px' }} gap={1} mt={2}>
                <RootPermissionsFilter permissions='canEditClients'>
                  <ButtonLink
                    data-testid='editClientButton'
                    startIcon={<PersonIcon />}
                    variant='outlined'
                    color='primary'
                    fullWidth
                    to={generateSafePath(ClientDashboardRoutes.EDIT, {
                      clientId: client.id,
                    })}
                  >
                    Update Client Details
                  </ButtonLink>
                </RootPermissionsFilter>
                <Typography variant='body2' sx={{ fontStyle: 'italic', mt: 1 }}>
                  Last Updated on {lastUpdated(client, true)}.{' '}
                  <RootPermissionsFilter permissions='canAuditClients'>
                    <RouterLink
                      to={generateSafePath(
                        ClientDashboardRoutes.AUDIT_HISTORY,
                        {
                          clientId: client.id,
                        }
                      )}
                    >
                      View client audit history
                    </RouterLink>
                  </RootPermissionsFilter>
                </Typography>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Card>
      {!onlyCard && (
        <Box
          sx={{
            mt: '-1px',
          }}
        >
          <ClientProfileCardAccordion client={client} />
        </Box>
      )}
    </>
  );
};

export default ClientProfileCard;
