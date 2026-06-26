import { FormControlLabel, Switch } from '@mui/material';
import { useState } from 'react';

import RestrictClientRecordModal, {
  RestrictClientRecordModalMode,
} from './RestrictClientRecordModal';
import { ClientPermissionsFilter } from '@/modules/permissions/PermissionsFilters';

interface Props {
  clientId: string;
  lockVersion: number;
  restricted: boolean;
}

const RestrictClientRecordToggle: React.FC<Props> = ({
  clientId,
  lockVersion,
  restricted,
}) => {
  const [modalMode, setModalMode] =
    useState<RestrictClientRecordModalMode | null>(null);

  return (
    <ClientPermissionsFilter id={clientId} permissions='canMarkRestricted'>
      <>
        <FormControlLabel
          control={
            <Switch
              checked={restricted}
              onChange={() =>
                setModalMode(restricted ? 'remove' : 'restrict')
              }
              data-testid='restrictClientRecordToggle'
            />
          }
          label='Restrict Record'
        />
        <RestrictClientRecordModal
          clientId={clientId}
          lockVersion={lockVersion}
          mode={modalMode}
          onClose={() => setModalMode(null)}
        />
      </>
    </ClientPermissionsFilter>
  );
};

export default RestrictClientRecordToggle;
