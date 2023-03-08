import { Typography, TypographyProps } from '@mui/material';
import { ReactNode } from 'react';

import ClickToShow from '@/components/elements/ClickToShow';
import NotSpecified from '@/components/elements/NotSpecified';
import { maskSSN } from '@/modules/hmis/hmisUtil';
import { useHasClientPermissions } from '@/modules/permissions/useHasPermissionsHooks';
import { ClientIdentificationFieldsFragment } from '@/types/gqlTypes';

export interface Props extends TypographyProps {
  client: ClientIdentificationFieldsFragment;
  noValue?: ReactNode;
  variant?: TypographyProps['variant'];
  lastFour?: boolean; // show the last 4 digits only (not hidden)
}

const ClientSsn = ({ client, noValue, lastFour, variant = 'body2' }: Props) => {
  const masked = maskSSN(client.ssn || undefined);
  if (!masked) return <>{noValue}</> || null;

  if (lastFour)
    return <Typography variant={variant}>{masked.slice(-4)}</Typography>;

  return (
    <ClickToShow text='Reveal SSN' variant={variant}>
      <Typography variant={variant}>{masked}</Typography>
    </ClickToShow>
  );
};

export const ClientSafeSsn: React.FC<Props> = (props) => {
  const { client } = props;

  const [canViewFullSsn] = useHasClientPermissions(client.id, [
    'canViewFullSsn',
  ]);
  const [canViewPartialSsn] = useHasClientPermissions(client.id, [
    'canViewPartialSsn',
  ]);

  const canSeeSsn = canViewFullSsn || canViewPartialSsn;

  if (!canSeeSsn) return null;

  return (
    <ClientSsn
      noValue={<NotSpecified />}
      lastFour={!canViewFullSsn && canViewPartialSsn}
      {...props}
      client={client}
    />
  );
};

export default ClientSsn;
