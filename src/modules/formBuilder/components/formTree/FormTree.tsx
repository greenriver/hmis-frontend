import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import React, { useMemo } from 'react';
import Loading from '@/components/elements/Loading';
import FormTreeItem, {
  TreeItemContext,
} from '@/modules/formBuilder/components/formTree/FormTreeItem';
import { getItemsForTree } from '@/modules/formBuilder/components/formTree/formTreeUtil';
import { FormDefinitionJson, FormItem } from '@/types/gqlTypes';

interface FormTreeProps {
  definition: FormDefinitionJson;
  setSelectedItem: (item: FormItem) => void;
}
const FormTree: React.FC<FormTreeProps> = ({ definition, setSelectedItem }) => {
  const definitionForTree = useMemo(
    () => getItemsForTree(definition),
    [definition]
  );

  const context = React.useMemo(
    () => ({
      onEditButtonClicked: setSelectedItem,
    }),
    [setSelectedItem]
  );

  if (!definition) return <Loading />;

  return (
    <TreeItemContext.Provider value={context}>
      <RichTreeView
        aria-label='form tree view'
        items={definitionForTree}
        getItemId={(item) => item.linkId}
        getItemLabel={(item) => item.text || item.helperText || item.linkId}
        slots={{ item: FormTreeItem }}
      />
    </TreeItemContext.Provider>
  );
};

export default FormTree;
