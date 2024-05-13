import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import React, { useMemo } from 'react';
import Loading from '@/components/elements/Loading';
import FormTreeItem from '@/modules/formBuilder/components/formTree/FormTreeItem';
import { getItemsForTree } from '@/modules/formBuilder/components/formTree/formTreeUtil';
import { FormDefinitionJson } from '@/types/gqlTypes';

interface FormTreeProps {
  definition: FormDefinitionJson;
}
const FormTree: React.FC<FormTreeProps> = ({ definition }) => {
  const definitionForTree = useMemo(
    () => getItemsForTree(definition),
    [definition]
  );

  if (!definition) return <Loading />;

  return (
    <RichTreeView
      aria-label='form tree view'
      disableSelection
      items={definitionForTree}
      getItemId={(item) => item.linkId}
      getItemLabel={(item) => item.text || item.helperText || item.linkId}
      slots={{ item: FormTreeItem }}
      onItemFocus={(_event, itemId) => {
        // TODO - add node onclick handler
        console.log(itemId);
      }}
    />
  );
};

export default FormTree;
