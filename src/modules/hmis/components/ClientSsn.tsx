import { Typography, TypographyProps } from '@mui/material';
import { ReactNode } from 'react';

import ClickToShow from '@/components/elements/ClickToShow';
import NotCollectedText from '@/components/elements/NotCollectedText';
import { maskSSN } from '@/modules/hmis/hmisUtil';
import { ClientIdentificationFieldsFragment } from '@/types/gqlTypes';

export interface Props extends TypographyProps {
  client: ClientIdentificationFieldsFragment;
  noValue?: ReactNode;
  variant?: TypographyProps['variant'];
  lastFour?: boolean; // show the last 4 digits only (not hidden)
  reveal?: boolean;
}

const ClientSsn = ({
  client,
  noValue,
  lastFour,
  variant = 'body2',
  reveal = false,
}: Props) => {
  const masked = maskSSN(client.ssn || undefined);
  if (!masked) return <>{noValue}</> || null;

  if (lastFour)
    return <Typography variant={variant}>{masked.slice(-4)}</Typography>;

  const fullSsn = <Typography variant={variant}>{masked}</Typography>;
  if (reveal) return fullSsn;
  return (
    <ClickToShow text='Reveal SSN' variant={variant}>
      {fullSsn}
    </ClickToShow>
  );
};

export const ClientSafeSsn: React.FC<Props> = ({ client, ...props }) => {
  const { canViewFullSsn, canViewPartialSsn } = client.access;
  if (!canViewFullSsn && !canViewPartialSsn) return null;

  return (
    <ClientSsn
      noValue={<NotCollectedText />}
      lastFour={!canViewFullSsn && canViewPartialSsn}
      {...props}
      client={client}
    />
  );
};

export default ClientSsn;
