import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import {
  Box,
  Card,
  Chip,
  Grid,
  Link,
  Skeleton,
  Stack,
  SxProps,
  Typography,
} from '@mui/material';
import { useCallback, useRef, useState } from 'react';

import ClientAddress from './ClientAddress';
import ClientCardImageElement from './ClientCardImageElement';
import ClientContactPoint from './ClientContactPoint';
import ButtonLink from '@/components/elements/ButtonLink';
import ExternalIdDisplay from '@/components/elements/ExternalIdDisplay';
import ClientImageUploadDialog from '@/components/elements/input/ClientImageUploadDialog';
import NotCollectedText from '@/components/elements/NotCollectedText';
import SimpleAccordion from '@/components/elements/SimpleAccordion';
import SimpleTable from '@/components/elements/SimpleTable';
import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import { ClientSafeSsn } from '@/modules/hmis/components/ClientSsn';
import HmisEnum, { MultiHmisEnum } from '@/modules/hmis/components/HmisEnum';
import {
  clientNameAllParts,
  lastUpdatedBy,
  pronouns,
} from '@/modules/hmis/hmisUtil';
import { ClientPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { useHasRootPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { ClientDashboardRoutes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  ClientFieldsFragment,
  ClientImageFragment,
  useGetClientImageQuery,
} from '@/types/gqlTypes';
import { generateSafePath } from '@/utils/pathEncoding';

interface Props {
  client: ClientFieldsFragment;
}

const ClientProfileCardTextTable = ({
  content,
  condensed = true,
}: {
  content:
    | Record<string, React.ReactNode>
    | Readonly<[React.ReactNode, React.ReactNode]>[];
  condensed?: boolean;
}) => {
  return (
    <SimpleTable
      TableCellProps={{
        sx: {
          borderBottom: 0,
          pt: 0,
          pb: condensed ? 1 : 2,
          px: 1,
          verticalAlign: 'baseline',
          '&:first-of-type': {
            pl: 0,
            pr: 2,
            width: '1px',
            whiteSpace: 'nowrap',
          },
        },
      }}
      columns={[
        {
          name: 'key',
          render: (row) => (
            <strong style={{ fontWeight: 600 }}>{row.label}</strong>
          ),
        },
        { name: 'value', render: (row) => row.value },
      ]}
      rows={(Array.isArray(content) ? content : Object.entries(content)).map(
        ([id, value], index) => ({ id: String(index), label: id, value })
      )}
    />
  );
};

const LabelWithSubtitle = ({
  label,
  subtitle,
}: {
  label: string;
  subtitle?: string;
}) => (
  <Stack>
    <span>{label}</span>
    {subtitle && (
      <Box
        component='span'
        fontWeight={400}
        fontStyle='italic'
        color='text.secondary'
      >
        {subtitle}
      </Box>
    )}
  </Stack>
);

const ClientProfileCardAccordion = ({ client }: Props): JSX.Element => {
  const hasContactInformation =
    client.addresses.length > 0 ||
    client.phoneNumbers.length > 0 ||
    client.emailAddresses.length > 0;

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
          sx: { '&.MuiAccordion-root': { mb: 0, mt: '-1px' } },
        }}
        items={[
          {
            key: 'Client IDs',
            content: (
              <ClientProfileCardTextTable
                content={client.externalIds.map((externalId, idx) => {
                  const repeated =
                    idx > 0 &&
                    client.externalIds[idx - 1].type === externalId.type;
                  return [
                    repeated ? null : (
                      <HmisEnum
                        enumMap={HmisEnums.ExternalIdentifierType}
                        value={externalId.type}
                        fontWeight={600}
                      />
                    ),
                    <ExternalIdDisplay value={externalId} />,
                  ] as const;
                })}
              />
            ),
          },
          ...(hasContactInformation
            ? [
                {
                  key: 'Contact Information',
                  content: (
                    <ClientProfileCardTextTable
                      condensed={false}
                      content={[
                        ...client.addresses.map((address) => {
                          return [
                            <LabelWithSubtitle
                              label='Address'
                              subtitle={
                                address.use
                                  ? HmisEnums.ClientAddressUse[address.use]
                                  : undefined
                              }
                            />,
                            <ClientAddress address={address} />,
                          ] as const;
                        }),
                        ...client.phoneNumbers.map((phoneNumber) => {
                          return [
                            <LabelWithSubtitle
                              label='Phone Number'
                              subtitle={
                                phoneNumber.use
                                  ? HmisEnums.ClientContactPointUse[
                                      phoneNumber.use
                                    ]
                                  : undefined
                              }
                            />,
                            <ClientContactPoint contactPoint={phoneNumber} />,
                          ] as const;
                        }),
                        ...client.emailAddresses.map((email) => {
                          return [
                            <>Email</>,
                            <ClientContactPoint contactPoint={email} />,
                          ] as const;
                        }),
                      ]}
                    />
                  ),
                },
              ]
            : []),
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
                      noData={HmisEnums.NoYesMissing.DATA_NOT_COLLECTED}
                      oneRowPerValue
                    />
                  ),
                  Gender: (
                    <>
                      <MultiHmisEnum
                        values={client.gender}
                        enumMap={HmisEnums.Gender}
                        noData={HmisEnums.NoYesMissing.DATA_NOT_COLLECTED}
                        oneRowPerValue
                      >
                        {client.differentIdentityText && (
                          <Typography variant='body2'>
                            {client.differentIdentityText}
                          </Typography>
                        )}{' '}
                      </MultiHmisEnum>
                    </>
                  ),
                  Pronouns: pronouns(client) || <NotCollectedText />,
                  'Veteran Status': (
                    <HmisEnum
                      value={client.veteranStatus}
                      enumMap={HmisEnums.NoYesReasonsForMissingData}
                      noData={HmisEnums.NoYesMissing.DATA_NOT_COLLECTED}
                    />
                  ),
                }}
              />
            ),
          },
        ]}
      />
    </Box>
  );
};

const ClientCardImage = ({
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

/**
 * Profile card displayed on the Client Dashboard Overview, with:
 * - Image
 * - Client Name
 * - Action to Edit
 * - Accordions with IDs, Demographics, and Contact Information
 */
const ClientProfileCard: React.FC<Props> = ({ client }) => {
  const {
    data: { client: clientImageData } = {},
    loading: imageLoading = false,
  } = useGetClientImageQuery({
    variables: { id: client.id },
  });

  const [canViewSsn] = useHasRootPermissions([
    'canViewFullSsn',
    'canViewPartialSsn',
  ]);

  return (
    <Box>
      <Card
        sx={{
          p: 2,
          borderBottomRightRadius: 0,
          borderBottomLeftRadius: 0,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant='h4'>{clientNameAllParts(client)}</Typography>
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
                  [client.dob ? 'DOB' : 'Age']: (
                    <ClientDobAge
                      client={client}
                      noValue={<NotCollectedText />}
                    />
                  ),
                  ...(canViewSsn
                    ? {
                        SSN: <ClientSafeSsn client={client} />,
                      }
                    : {}),
                }}
              />
              <Stack sx={{ flexGrow: 1, maxWidth: '300px' }} gap={1} mt={2}>
                <ClientPermissionsFilter
                  id={client.id}
                  permissions={['canEditClient', 'canViewClientName']}
                  mode='all'
                >
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
                </ClientPermissionsFilter>
                {client.dateUpdated && (
                  <Typography
                    variant='body2'
                    sx={{ fontStyle: 'italic', mt: 1 }}
                  >
                    Last Updated on{' '}
                    {lastUpdatedBy(client.dateUpdated, client.user)}.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Card>
      <Box sx={{ mt: '-1px' }}>
        <ClientProfileCardAccordion client={client} />
      </Box>
    </Box>
  );
};

export default ClientProfileCard;
