import { Typography, TypographyProps } from '@mui/material';
import { ReactNode } from 'react';

import ClickToShow from '@/components/elements/ClickToShow';
import { maskSSN } from '@/modules/hmis/hmisUtil';
import { ClientIdentificationFieldsFragment } from '@/types/gqlTypes';

interface Props extends TypographyProps {
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

export default ClientSsn;
