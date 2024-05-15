import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import React, { useMemo } from 'react';
import Loading from '@/components/elements/Loading';
import FormTreeItem from '@/modules/formBuilder/components/formTree/FormTreeItem';
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

  if (!definition) return <Loading />;

  return (
    <RichTreeView
      aria-label='form tree view'
      items={definitionForTree}
      getItemId={(item) => item.linkId}
      getItemLabel={(item) => item.text || item.helperText || item.linkId}
      slots={{ item: FormTreeItem }} // todo @Martha - this is working, but typescript is not happy
      slotProps={{
        item: {
          onEditClicked: (item: FormItem) => {
            setSelectedItem(item);
          },
        },
      }}
    />
  );
};

export default FormTree;
