import { Typography, TypographyProps } from '@mui/material';
import { ReactNode } from 'react';

import ClickToShow from '@/components/elements/ClickToShow';
import { maskSSN } from '@/modules/hmis/hmisUtil';
import { ClientIdentificationFieldsFragment } from '@/types/gqlTypes';

interface Props extends TypographyProps {
  client: ClientIdentificationFieldsFragment;
  noValue?: ReactNode;
  variant?: TypographyProps['variant'];
}

const ClientSsn = ({ client, noValue, variant = 'body2' }: Props) => {
  const masked = maskSSN(client.ssn || undefined);
  if (!masked) return <>{noValue}</> || null;

  return (
    <ClickToShow text='Reveal SSN' variant={variant}>
      <Typography variant={variant}>{masked}</Typography>
    </ClickToShow>
  );
};

export default ClientSsn;
