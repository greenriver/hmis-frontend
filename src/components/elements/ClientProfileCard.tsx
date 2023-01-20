import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  BoxProps,
  Card,
  Grid,
  Link,
  Skeleton,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { useCallback, useState } from 'react';

import ButtonLink from './ButtonLink';
import ClientImageUploadDialog from './input/ClientImageUploadDialog';
import SimpleAccordion from './SimpleAccordion';
import SimpleTable from './SimpleTable';

import ClientDobAge from '@/modules/hmis/components/ClientDobAge';
import ClientSsn from '@/modules/hmis/components/ClientSsn';
import { clientNameWithoutPreferred, pronouns } from '@/modules/hmis/hmisUtil';
import { DashboardRoutes } from '@/routes/routes';
import {
  ClientFieldsFragment,
  ClientImageFragment,
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
          whiteSpace: 'nowrap',
          '&:first-of-type': { pl: 0, width: '1px' },
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
        '& .Mui-expanded:first-of-type': {
          mt: 0,
        },
      }}
    >
      <SimpleAccordion
        renderHeader={(header) => <Typography>{header}</Typography>}
        items={[
          {
            key: 'Client Contact Information',
            content: (
              <ClientProfileCardTextTable
                content={{
                  Race: client.race.join(', '),
                  Ethnicity: client.ethnicity,
                  Gender: client.gender.join(', '),
                  Pronouns: pronouns(client),
                  'Veteran Status': client.veteranStatus,
                }}
              />
            ),
          },
          {
            key: 'Case Manager',
            content: 'TK',
          },
          {
            key: 'Housing Status',
            content: 'TK',
          },
          {
            key: 'Demographics',
            content: 'TK',
          },
        ]}
      />
    </Box>
  );
};

export const ClientCardImageElement = ({
  client,
  base64,
  url,
  ...props
}: {
  client?: ClientImageFragment;
  base64?: string;
  url?: string;
} & BoxProps<'img'>) => {
  let src = 'https://dummyimage.com/150x150/e8e8e8/aaa';

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
        height: 175,
        width: 175,
        ...props.sx,
      }}
      component='img'
    />
  );
};

export const ClientCardImage = ({
  client,
}: {
  client?: ClientImageFragment;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = useCallback(() => setOpen(false), []);
  const handleOpen = useCallback(() => setOpen(true), []);

  if (!client) return <ClientCardImageElement />;

  return (
    <>
      <ClientImageUploadDialog
        open={open}
        onClose={handleClose}
        clientId={client.id}
      />
      <Link component='button'>
        <ClientCardImageElement client={client} onClick={handleOpen} />
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

  console.log({ client });

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
            <Typography sx={{ float: 'right', ml: 1, mb: 1 }}>
              <strong>ID</strong> {client.id}
            </Typography>
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
              <ClientCardImage client={clientImageData || undefined} />
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <ClientProfileCardTextTable
                content={{
                  Pronouns: pronouns(client),
                  Age: <ClientDobAge client={client} />,
                  Social: <ClientSsn client={client} />,
                }}
              />
              <Box sx={{ flexGrow: 1 }}>
                <ButtonLink
                  data-testid='editClientButton'
                  startIcon={<EditIcon />}
                  variant='outlined'
                  fullWidth
                  sx={{ mt: 2, mb: 1 }}
                  to={generateSafePath(DashboardRoutes.EDIT, {
                    clientId: client.id,
                  })}
                >
                  Update Client Details
                </ButtonLink>

                <Typography color='GrayText' variant='body2'>
                  <em>
                    Last Updated{' '}
                    {format(new Date(client.dateUpdated), 'M/d/yyyy')} by [TK]
                  </em>
                </Typography>
              </Box>
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
