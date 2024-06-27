import { Alert } from '@mui/material';
import { Box } from '@mui/system';
import React, { Dispatch, SetStateAction } from 'react';
import { CommonUnorderedList } from '@/components/CommonUnorderedList';
import ConfirmationDialog from '@/components/elements/ConfirmationDialog';
import { ItemMap } from '@/modules/form/types';
import { displayLabelForItem } from '@/modules/formBuilder/formBuilderUtil';
import { ItemDependents } from '@/modules/formBuilder/types';
import { FormItem } from '@/types/gqlTypes';

const dependentLabelMap: Record<string, string> = {
  autofillDependents: 'Items with autofill condition(s)',
  enableWhenDependents: 'Items with visibility condition(s)',
  boundDependents: 'Items with min/max bound(s)',
};

interface CannotDeleteItemDialogProps {
  item: FormItem;
  itemMap: ItemMap;
  deletionBlockers: ItemDependents;
  setDeletionBlockers: Dispatch<SetStateAction<ItemDependents | undefined>>;
  ancestorLinkIdMap: Record<string, string[]>;
}

const CannotDeleteItemDialog: React.FC<CannotDeleteItemDialogProps> = ({
  item,
  itemMap,
  deletionBlockers,
  setDeletionBlockers,
  ancestorLinkIdMap,
}) => {
  return (
    <ConfirmationDialog
      open={!!deletionBlockers}
      title='Cannot delete item'
      onConfirm={() => setDeletionBlockers(undefined)}
      confirmText='Close'
      loading={false}
      hideCancelButton={true}
    >
      "{displayLabelForItem(item)}" cannot be deleted because it is referenced
      elsewhere.
      <Alert
        color='error'
        icon={false}
        sx={{ my: 2, '& .MuiAlert-message': { width: '100%' } }}
      >
        {Object.entries(deletionBlockers).map(([key, val]) =>
          val?.length > 0 ? (
            <Box key={key}>
              {dependentLabelMap[key]}:
              <CommonUnorderedList>
                {val.map((dep) => (
                  <li key={dep.linkId}>
                    {ancestorLinkIdMap[dep.linkId].map(
                      (ancestor) =>
                        `"${displayLabelForItem(itemMap[ancestor])}" > `
                    )}
                    {`"${displayLabelForItem(dep)}"`}
                  </li>
                ))}
              </CommonUnorderedList>
            </Box>
          ) : null
        )}
      </Alert>
      All references to this item must be removed before it can be deleted.
    </ConfirmationDialog>
  );
};

export default CannotDeleteItemDialog;
