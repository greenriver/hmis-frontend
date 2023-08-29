import { Typography, TypographyProps } from '@mui/material';
import { ReactNode } from 'react';

import ClickToShow, {
  Props as ClickToShowProps,
} from '@/components/elements/ClickToShow';
import NotCollectedText from '@/components/elements/NotCollectedText';
import { maskSSN } from '@/modules/hmis/hmisUtil';
import { ClientIdentificationFieldsFragment } from '@/types/gqlTypes';

export interface Props
  extends TypographyProps,
    Pick<ClickToShowProps, 'hide' | 'onToggle'> {
  client: ClientIdentificationFieldsFragment;
  noValue?: ReactNode;
  variant?: TypographyProps['variant'];
  lastFour?: boolean; // show the last 4 digits only (not hidden)
  alwaysShow?: boolean;
}

const ClientSsn = ({
  client,
  noValue,
  lastFour,
  variant = 'body2',
  alwaysShow = false,
  hide,
  onToggle,
}: Props) => {
  const masked = maskSSN(client.ssn || undefined);
  if (!masked) return <>{noValue}</> || null;

  if (lastFour)
    return <Typography variant={variant}>{masked.slice(-4)}</Typography>;

  const fullSsn = (
    <Typography variant={variant} sx={{ whiteSpace: 'nowrap' }}>
      {masked}
    </Typography>
  );
  if (alwaysShow) return fullSsn;
  return (
    <ClickToShow variant={variant} hide={hide} onToggle={onToggle}>
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
