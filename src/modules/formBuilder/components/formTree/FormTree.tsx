import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import React, { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import {
  displayLabelForItem,
  getAncestorLinkIdMap,
  getRhfPathMap,
} from '../../formBuilderUtil';
import Loading from '@/components/elements/Loading';
import { getItemMap } from '@/modules/form/util/formUtil';
import { FormTreeContext } from '@/modules/formBuilder/components/formTree/FormTreeContext';
import FormTreeItem from '@/modules/formBuilder/components/formTree/FormTreeItem';
import { getItemsForTree } from '@/modules/formBuilder/components/formTree/formTreeUtil';
import { FormDefinitionJson, FormItem } from '@/types/gqlTypes';

interface FormTreeProps {
  onEditClick: (item: FormItem) => void;
}
const FormTree: React.FC<FormTreeProps> = ({ onEditClick }) => {
  const { control } = useFormContext();
  const values = useWatch({ control });

  const definitionForTree = useMemo(
    () => getItemsForTree(values.item),
    [values.item]
  );

  const itemMap = useMemo(
    () => getItemMap(values as FormDefinitionJson),
    [values]
  );

  const rhfPathMap = useMemo(() => getRhfPathMap(values.item), [values]);

  const ancestorLinkIdMap = useMemo(
    () => getAncestorLinkIdMap(values.item),
    [values]
  );

  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  // For a better ux when reordering form items, we hijack control of the focused button. See useEffect in FormTreeLabel
  const [focusedTreeButton, setFocusedTreeButton] = React.useState<
    string | null
  >(null);

  const handleExpandedItemsChange = (
    event: React.SyntheticEvent,
    itemIds: string[]
  ) => {
    setExpandedItems(itemIds);
  };

  // Passing these values via FormTreeContext here enables us to easily pass props down
  // to the FormTreeItem and FormTreeLabel components, avoiding slotProps and its typescript issues
  const context = React.useMemo(
    () => ({
      openFormItemEditor: (item: FormItem) => onEditClick(item),
      expandItem: (itemId: string) =>
        setExpandedItems((prev) => [...prev, itemId]),
      collapseItem: (itemId: string) =>
        setExpandedItems((prev) => prev.filter((id) => id !== itemId)),
      // These maps are regenerated on every change to the form, due to the `useWatch`.
      // This shouldn't cause a perf issue right now, because this context is only consumed by the FormTreeLabel,
      // which is already calling useWatch({ control }) anyway (inside the useUpdateFormStructure hook).
      // But it could cause performance issues if other components consume this context.
      itemMap,
      rhfPathMap,
      ancestorLinkIdMap,
      focusedTreeButton,
      setFocusedTreeButton,
    }),
    [
      onEditClick,
      itemMap,
      rhfPathMap,
      ancestorLinkIdMap,
      focusedTreeButton,
      setFocusedTreeButton,
    ]
  );

  if (!values.item) return <Loading />;

  return (
    <FormTreeContext.Provider value={context}>
      <RichTreeView
        aria-label='form tree view'
        items={definitionForTree}
        getItemId={(item) => item.linkId}
        getItemLabel={(item) => displayLabelForItem(item, false)}
        slots={{ item: FormTreeItem }}
        expandedItems={expandedItems}
        onExpandedItemsChange={handleExpandedItemsChange}
        disableSelection
      />
    </FormTreeContext.Provider>
  );
};

export default FormTree;
