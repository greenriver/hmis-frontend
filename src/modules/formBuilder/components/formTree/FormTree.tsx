import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import React, { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { displayLabelForItem, getRhfPathMap } from '../../formBuilderUtil';
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

  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const handleExpandedItemsChange = (
    event: React.SyntheticEvent,
    itemIds: string[]
  ) => {
    setExpandedItems(itemIds);
  };

  const context = React.useMemo(
    () => ({
      openFormItemEditor: (item: FormItem) => onEditClick(item),
      expandItem: (itemId: string) =>
        setExpandedItems((prev) => [...prev, itemId]),
      collapseItem: (itemId: string) =>
        setExpandedItems((prev) => prev.filter((id) => id !== itemId)),
      itemMap,
      rhfPathMap,
    }),
    [onEditClick, itemMap]
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
