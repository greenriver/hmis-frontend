import { Box, Stack, StackProps, Typography } from '@mui/material';
import { filter, isNil } from 'lodash-es';
import { ReactNode } from 'react';

import { CommonLabeledTextBlock } from './CommonLabeledTextBlock';
import ExternalLink from './ExternalLink';

import { isHouseholdClient } from '@/modules/household/types';
import {
  ClientFieldsFragment,
  ExternalIdentifier,
  ExternalIdentifierType,
  HouseholdClientFieldsFragment,
} from '@/types/gqlTypes';

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

export const externalIdColumn = (
  type: ExternalIdentifierType,
  label: string
) => ({
  header: label,
  render: (
    record: ClientFieldsFragment | HouseholdClientFieldsFragment,
    props?: ExternalIdDisplayProps
  ) => {
    const client = isHouseholdClient(record) ? record.client : record;
    return (
      <Stack gap={0.8}>
        {filter(client.externalIds, { type }).map((val) => (
          <ExternalIdDisplay key={val?.identifier} value={val} {...props} />
        ))}
      </Stack>
    );
  },
  dontLink: true,
});

export const LabeledExternalIdDisplay = ({
  type,
  externalIds,
  label,
  gap,
  ...props
}: Omit<ExternalIdDisplayProps, 'value'> & {
  type?: ExternalIdentifierType;
  label?: ReactNode;
  externalIds: ExternalIdentifier[];
  gap?: StackProps['gap'];
}) => {
  const filtered = filter(externalIds, { type });
  if (!filtered || filtered.length === 0) return null;
  return (
    <Stack gap={gap}>
      {filtered.map((externalId, idx) => (
        <CommonLabeledTextBlock
          title={
            idx > 0 && label ? (
              // If there are multiple w same label, hide label for subsequent
              <Box visibility='hidden'>{label}</Box>
            ) : (
              label || externalId.label
            )
          }
          horizontal
        >
          <ExternalIdDisplay {...props} value={externalId} />
        </CommonLabeledTextBlock>
      ))}
    </Stack>
  );
};

export default ExternalIdDisplay;
