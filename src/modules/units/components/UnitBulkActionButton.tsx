import { Typography } from '@mui/material';
import { capitalize } from 'lodash-es';
import GenericMutationButton from '@/modules/dataFetching/components/GenericMutationButton';
import {
  MarkUnitsUnavailableDocument,
  MarkUnitsAvailableDocument,
} from '@/types/gqlTypes';

interface Props {
  action: 'start' | 'stop';
  queryDocument:
    | typeof MarkUnitsUnavailableDocument
    | typeof MarkUnitsAvailableDocument;
  unitIds: string[];
  tooltip?: string;
  disabled?: boolean;
}

const UnitBulkActionButton = ({
  action,
  unitIds,
  queryDocument,
  tooltip,
  disabled,
}: Props) => {
  const capitalized = capitalize(action);

  return (
    <GenericMutationButton
      queryDocument={queryDocument}
      variables={{ unitIds }}
      idPath={'units'}
      buttonTooltip={tooltip}
      ButtonProps={{
        disabled: disabled,
        variant: 'contained',
        sx: { width: '100%' },
      }}
      ConfirmationDialogProps={{
        title: `${capitalized} Accepting Referrals for Unit(s)`,
        confirmText: `Yes, ${action} accepting referrals`,
      }}
      dialogContent={
        <Typography>
          Would you like to {action} accepting referrals for {unitIds.length}{' '}
          unit
          {unitIds.length > 1 ? 's' : ''}?
        </Typography>
      }
    >
      {capitalized} Accepting Referrals ({unitIds.length})
    </GenericMutationButton>
  );
};

export default UnitBulkActionButton;
