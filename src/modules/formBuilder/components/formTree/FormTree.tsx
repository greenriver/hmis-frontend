import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import React, { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import Loading from '@/components/elements/Loading';
import { FormTreeContext } from '@/modules/formBuilder/components/formTree/FormTreeContext';
import FormTreeItem from '@/modules/formBuilder/components/formTree/FormTreeItem';
import { getItemsForTree } from '@/modules/formBuilder/components/formTree/formTreeUtil';
import { FormItem } from '@/types/gqlTypes';

interface FormTreeProps {
  onEditClick: (item: FormItem) => void;
  itemIdMap: Record<string, string>;
}
const FormTree: React.FC<FormTreeProps> = ({ onEditClick, itemIdMap }) => {
  const { control } = useFormContext();
  const items = useWatch({ name: 'item', control });

  const definitionForTree = useMemo(() => getItemsForTree(items), [items]);

  const context = React.useMemo(
    () => ({
      onEditButtonClicked: (item: FormItem) => {
        onEditClick(item);
      },
      itemIdMap,
    }),
    [onEditClick, itemIdMap]
  );

  if (!items) return <Loading />;

  return (
    <FormTreeContext.Provider value={context}>
      <RichTreeView
        aria-label='form tree view'
        items={definitionForTree}
        getItemId={(item) => item.linkId}
        getItemLabel={(item) => item.text || item.helperText || item.linkId}
        slots={{ item: FormTreeItem }}
      />
    </FormTreeContext.Provider>
  );
};

export default FormTree;
