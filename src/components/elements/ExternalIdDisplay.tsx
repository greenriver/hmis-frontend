import { Box, Typography } from '@mui/material';
import { find, isNil } from 'lodash-es';
import { ReactNode } from 'react';

import ExternalLink from './ExternalLink';

import { ClientFieldsFragment, ExternalIdentifier } from '@/types/gqlTypes';

export interface ExternalIdDisplayProps {
  value?: ExternalIdentifier;
  noneDisplay?: ReactNode;
  noLink?: boolean;
}
const ExternalIdDisplay = ({
  value,
  noneDisplay,
  noLink = false,
}: ExternalIdDisplayProps) => {
  const missingDisplay = !isNil(noneDisplay) ? (
    <>{noneDisplay}</>
  ) : (
    <Typography variant='inherit' color='text.secondary'>
      None
    </Typography>
  );

  if (!value) return missingDisplay;

  const { url, identifier } = value;
  if (url && identifier && !noLink) {
    return (
      <ExternalLink variant='inherit' href={url}>
        {identifier}
      </ExternalLink>
    );
  }

  if (identifier) {
    return <Typography variant='inherit'>{identifier}</Typography>;
  }

  return missingDisplay;
};

export const externalIdColumn = (label: string) => ({
  header: label,
  width: '5%',
  render: (client: ClientFieldsFragment, props?: ExternalIdDisplayProps) => {
    return (
      <ExternalIdDisplay
        value={client.externalIds.find((c) => c.label == label)}
        {...props}
      />
    );
  },
  dontLink: true,
});

export const LabeledExternalIdDisplay = ({
  label,
  externalIds,
  ...props
}: Omit<ExternalIdDisplayProps, 'value'> & {
  label?: string;
  externalIds: ExternalIdentifier[];
}) => {
  return (
    <Typography
      variant='body2'
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.8,
      }}
    >
      {label}:{' '}
      <Box component='span' sx={{ wordBreak: 'break-all' }}>
        <ExternalIdDisplay {...props} value={find(externalIds, { label })} />
      </Box>
    </Typography>
  );
};

export default ExternalIdDisplay;
