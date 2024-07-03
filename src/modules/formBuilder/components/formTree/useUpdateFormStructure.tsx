import { get } from 'lodash-es';
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import {
  Control,
  useFieldArray,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { ItemMap } from '@/modules/form/types';
import {
  getDependentItems,
  getPathContext,
  insertItemToDefinition,
  removeItemFromDefinition,
} from '@/modules/formBuilder/formBuilderUtil';
import { ItemDependents } from '@/modules/formBuilder/types';
import { FormDefinitionJson, FormItem, ItemType } from '@/types/gqlTypes';

const MAX_NESTING_DEPTH = 5;

export default function useUpdateFormStructure(
  control: Control,
  itemId: string,
  item: FormItem,
  itemMap: ItemMap,
  rhfPathMap: Record<string, string>,
  expandItem: (itemId: string) => void
) {
  const values = useWatch({ control });
  const { reset } = useFormContext();

  // Example:
  // itemPath:              item.3.item.1
  // parentArrayPath:       item.3.item (thisIndex=1)
  // grandParentArrayPath:  item        (parentIndex=3)

  const itemPath = rhfPathMap[itemId];
  const {
    parentPath: parentArrayPath,
    index: thisIndex,
    nestingDepth,
  } = getPathContext(itemPath);
  const parentItemId = parentArrayPath.replace(/\.item$/, '');
  const { parentPath: grandParentArrayPath, index: parentIndex } =
    getPathContext(parentItemId);

  // RHF swap is used for swapping items within an array
  const { swap, remove } = useFieldArray({ control, name: parentArrayPath });

  const thisLayer = get(values, parentArrayPath);
  // `thisLayer` could be undefined if an item was just deleted. https://github.com/greenriver/hmis-frontend/pull/821#issue-2371078251

  const hasParent = parentIndex !== -1;

  const canMoveDown = useMemo(() => {
    const hasSiblingBelow = thisLayer ? !!thisLayer[thisIndex + 1] : false;
    return hasSiblingBelow || hasParent;
  }, [hasParent, thisIndex, thisLayer]);

  const canMoveUp = useMemo(() => {
    const hasSiblingAbove = thisIndex > 0;
    return hasSiblingAbove || hasParent;
  }, [hasParent, thisIndex]);

  const onDelete = useCallback(
    (onError: Dispatch<SetStateAction<ItemDependents | undefined>>) => {
      const dependents: ItemDependents = getDependentItems({
        linkId: itemId,
        itemMap,
      });

      if (Object.values(dependents).some((depList) => depList.length > 0)) {
        onError(dependents);
      } else {
        remove(thisIndex);
      }
    },
    [itemId, thisIndex, remove, itemMap]
  );

  // This restriction prevents nesting a Group beyond MAX_NESTING_DEPTH - 1.
  // This way regular (non-group) items can't ever be nested beyond MAX_NESTING_DEPTH.
  const isMaxDepth = useMemo(
    () =>
      item.type === ItemType.Group && nestingDepth === MAX_NESTING_DEPTH - 1,
    [item.type, nestingDepth]
  );

  const onReorder = useCallback(
    (direction: 'up' | 'down') => {
      if (direction === 'up') {
        // If index > 0, we can move this item up within its existing "layer"
        if (thisIndex > 0) {
          const prevItem = thisLayer[thisIndex - 1]; // sibling above current item
          if (prevItem.type === ItemType.Group && !isMaxDepth) {
            // CASE 1: If the item above it is a group, we remove this item and
            // append it to the "sibling" group above it, as long as we haven't reached max depth
            const prevLinkId = prevItem.linkId;
            const prevItemPath = rhfPathMap[prevLinkId] + '.item';

            expandItem(prevLinkId); // expand the group it's moving into
            reset(
              (oldForm) => {
                removeItemFromDefinition({
                  removeFromPath: parentArrayPath,
                  removeFromIndex: thisIndex,
                  definition: oldForm as FormDefinitionJson,
                });
                insertItemToDefinition({
                  insertPath: prevItemPath,
                  insertAtIndex: get(oldForm, prevItemPath)?.length || 0,
                  definition: oldForm as FormDefinitionJson,
                  item,
                });
                return oldForm;
              },
              { keepDefaultValues: true }
            );
          } else {
            // CASE 2: Swap this item with the item above it
            swap(thisIndex, thisIndex - 1);
          }
        } else if (hasParent) {
          // CASE 3: This item is the first item in its group, so we need to move it "out"
          // of its group and insert it into its parent array.

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

          // else, this is the first item in the top layer, so no action can be taken
        }
      } else if (direction === 'down') {
        const nextItem = thisLayer[thisIndex + 1]; // sibling below current item

        if (nextItem) {
          if (nextItem.type === ItemType.Group && !isMaxDepth) {
            // CASE 4: If the item below it is a group, we remove this item and
            // prepend it to the "sibling" group below it, as long as we haven't reached max depth
            const nextLinkId = nextItem.linkId;
            const nextItemPath = rhfPathMap[nextLinkId] + '.item';

            expandItem(nextLinkId); // expand the group it's moving into
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
            // CASE 5: Swap this item with the item below it
            swap(thisIndex, thisIndex + 1);
          }
        } else {
          if (hasParent) {
            // CASE 6: This is the last item at this depth. Move into the parent layer

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
          } // else, this is the last item in the top layer, so no action can be taken
        }
      }
    },
    [
      thisIndex,
      hasParent,
      thisLayer,
      rhfPathMap,
      reset,
      expandItem,
      parentArrayPath,
      item,
      swap,
      grandParentArrayPath,
      parentIndex,
      isMaxDepth,
    ]
  );

  return { onReorder, onDelete, itemPath, canMoveUp, canMoveDown };
}
