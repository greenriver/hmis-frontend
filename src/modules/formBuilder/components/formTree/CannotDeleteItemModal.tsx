import { Alert, List, ListItem } from '@mui/material';
import { Box } from '@mui/system';
import React, { Dispatch, SetStateAction } from 'react';
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

interface CannotDeleteItemModalProps {
  item: FormItem;
  itemMap: ItemMap;
  itemDependents: ItemDependents;
  setItemDependents: Dispatch<SetStateAction<ItemDependents | undefined>>;
  ancestorLinkIdMap: Record<string, string[]>;
}

const CannotDeleteItemModal: React.FC<CannotDeleteItemModalProps> = ({
  item,
  itemMap,
  itemDependents,
  setItemDependents,
  ancestorLinkIdMap,
}) => {
  return (
    <ConfirmationDialog
      open={!!itemDependents}
      title='Cannot delete item'
      onConfirm={() => setItemDependents(undefined)}
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
        {Object.entries(itemDependents).map(([key, val]) =>
          val?.length > 0 ? (
            <Box key={key}>
              {dependentLabelMap[key]}:
              <List sx={{ listStyleType: 'disc', py: 0 }}>
                {val.map((dep) => (
                  <ListItem
                    sx={{
                      display: 'list-item',
                      ml: 4,
                      px: 0,
                      maxWidth: 'calc(100% - 32px)',
                    }}
                    key={dep.linkId}
                  >
                    {ancestorLinkIdMap[dep.linkId].map(
                      (ancestor) =>
                        `"${displayLabelForItem(itemMap[ancestor])}" > `
                    )}
                    {`"${displayLabelForItem(dep)}"`}
                  </ListItem>
                ))}
              </List>
            </Box>
          ) : null
        )}
      </Alert>
      All references to this item must be removed before it can be deleted.
    </ConfirmationDialog>
  );
};

export default CannotDeleteItemModal;
