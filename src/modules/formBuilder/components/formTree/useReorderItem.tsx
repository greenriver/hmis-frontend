import { get } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import {
  Control,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import {
  getItemIdMap,
  getPathContext,
  insertItemToDefinition,
  removeItemFromDefinition,
} from '@/modules/formBuilder/formBuilderUtil';
import { FormDefinitionJson, FormItem, ItemType } from '@/types/gqlTypes';

// TODO(#6094) - Disable up/down buttons if item can't move up/down
// TODO(#6094) - Limit nesting depth to 5
// TODO(#6094) - Auto open a group when an item is moved into it.
//  This involves turning Mui Tree's expandedItems into a controlled prop - see https://github.com/greenriver/hmis-frontend/pull/797
// TODO figure out why there are empty keys being added to the form definition ''
export default function useReorderItem(
  control: Control,
  itemId: string,
  item: FormItem
) {
  const values = useWatch({ control });
  const { reset } = useFormContext();

  // Re-generate itemIdMap each time values change (linkId=>position)
  const itemIdMap = useMemo(() => getItemIdMap(values.item), [values]);

  // Example:
  // itemPath:              item.3.item.1
  // parentArrayPath:       item.3.item (thisIndex=1)
  // grandParentArrayPath:  item        (parentIndex=3)

  const itemPath = itemIdMap[itemId];
  if (!itemPath) throw new Error(`No itemPath found for linkId ${itemId}`);
  const { parentPath: parentArrayPath, index: thisIndex } =
    getPathContext(itemPath);
  const { parentPath: grandParentArrayPath, index: parentIndex } =
    getPathContext(parentArrayPath.replace(/\.item$/, ''));

  // RHF swap is used for swapping items within an array
  const { swap } = useFieldArray({ control, name: parentArrayPath });

  const thisLayer = get(values, parentArrayPath);
  if (!thisLayer)
    throw new Error(`failed to find parentArrayPath: ${parentArrayPath}`);

  const hasParent = parentIndex !== -1;

  const canMoveDown = useMemo(() => {
    const hasSiblingBelow = !!thisLayer[thisIndex + 1];
    return hasSiblingBelow || hasParent;
  }, [hasParent, thisIndex, thisLayer]);

  const canMoveUp = useMemo(() => {
    const hasSiblingAbove = thisIndex > 0;
    return hasSiblingAbove || hasParent;
  }, [hasParent, thisIndex]);

  const onReorder = useCallback(
    (direction: 'up' | 'down') => {
      if (direction === 'up') {
        // If index > 0, we can move this item up within its existing "layer"
        if (thisIndex > 0) {
          const prevItem = thisLayer[thisIndex - 1]; // sibling above current item
          if (prevItem.type === ItemType.Group) {
            // CASE 1: If the item above it is a group, we remove this item and
            // append it to the "sibling" group above it
            console.log('case 1');
            const prevLinkId = prevItem.linkId;
            const prevItemPath = itemIdMap[prevLinkId] + '.item';
            reset(
              (oldForm) => {
                removeItemFromDefinition({
                  removeFromPath: parentArrayPath,
                  removeFromIndex: thisIndex,
                  definition: oldForm as FormDefinitionJson,
                });
                insertItemToDefinition({
                  insertPath: prevItemPath,
                  insertAtIndex: get(oldForm, prevItemPath).length,
                  definition: oldForm as FormDefinitionJson,
                  item,
                });
                return oldForm;
              },
              { keepDefaultValues: true }
            );
          } else {
            // CASE 2: Swap this item with the (non-group) item above it
            console.log('case 2');
            swap(thisIndex, thisIndex - 1);
          }
        } else if (hasParent) {
          // CASE 3: This item is the first item in its group, so we need to move it "out"
          // of its group and insert it into it's parent array.
          console.log('case 3');
          reset(
            (oldForm) => {
              removeItemFromDefinition({
                removeFromPath: parentArrayPath,
                removeFromIndex: 0,
                definition: oldForm as FormDefinitionJson,
              });
              insertItemToDefinition({
                insertPath: grandParentArrayPath,
                insertAtIndex: parentIndex,
                definition: oldForm as FormDefinitionJson,
                item,
              });
              return oldForm;
            },
            { keepDefaultValues: true }
          );
          // else, this is the first item in the top layer, so hitting the 'up' button does nothing.
        }
      } else if (direction === 'down') {
        const nextItem = thisLayer[thisIndex + 1]; // sibling below current item

        if (nextItem) {
          if (nextItem.type === ItemType.Group) {
            // CASE 4: If the item below it is a group, we remove this item and
            // prepend it to the "sibling" group below it
            console.log('case 4');
            const nextLinkId = nextItem.linkId;
            const nextItemPath = itemIdMap[nextLinkId] + '.item';

            reset(
              (oldForm) => {
                insertItemToDefinition({
                  insertPath: nextItemPath,
                  insertAtIndex: 0, // prepend to sibling below
                  definition: oldForm as FormDefinitionJson,
                  item,
                });
                removeItemFromDefinition({
                  removeFromPath: parentArrayPath,
                  removeFromIndex: thisIndex,
                  definition: oldForm as FormDefinitionJson,
                });
                return oldForm;
              },
              { keepDefaultValues: true }
            );
          } else {
            // CASE 5: Swap this item with the (non-group) item below it
            console.log('case 5');
            swap(thisIndex, thisIndex + 1);
          }
        } else {
          if (hasParent) {
            // CASE 6: This is the last item at this depth. Move into the parent layer
            console.log('case 6', parentIndex);
            reset(
              (oldForm) => {
                insertItemToDefinition({
                  insertPath: grandParentArrayPath,
                  insertAtIndex: parentIndex + 1,
                  definition: oldForm as FormDefinitionJson,
                  item,
                });
                removeItemFromDefinition({
                  removeFromPath: parentArrayPath,
                  removeFromIndex: get(oldForm, parentArrayPath).length - 1, // remove the last item
                  definition: oldForm as FormDefinitionJson,
                });
                return oldForm;
              },
              { keepDefaultValues: true }
            );
          } // else, this is the last item in the top layer, so hitting the 'down' button does nothing.
        }
      }
    },
    [
      thisIndex,
      hasParent,
      thisLayer,
      itemIdMap,
      reset,
      parentArrayPath,
      item,
      swap,
      grandParentArrayPath,
      parentIndex,
    ]
  );

  return { onReorder, itemPath, canMoveUp, canMoveDown };
}
