import { RichTreeView } from '@mui/x-tree-view/RichTreeView';
import React, { useMemo } from 'react';
import Loading from '@/components/elements/Loading';
import FormTreeItem from '@/modules/formBuilder/components/formTree/FormTreeItem';
import { FormDefinitionJson } from '@/types/gqlTypes';

interface FormTreeProps {
  definition: FormDefinitionJson;
}
const FormTree: React.FC<FormTreeProps> = ({ definition }) => {
  // TODO - let's discuss the best way to support nesting
  // MUI tree view component expects the 'item' prop to be named 'children', and doesn't provide an overrider function.
  // OS contribution to react mui that provides an override? (but maybe there's a reason they don't allow)
  // rewriting our DSL to use 'children' instead of 'item'? (but this feels like big lift + bad coupling)
  // keep and clean up the below adapter, expanding it to n layers of nesting (n = 5?) ?
  // We might need something like this adapter anyway to consolidate down some functional groups, like SSN
  const definitionForTree = useMemo(() => {
    if (!definition?.item) return [];
    return definition.item.map((i) => {
      return {
        ...i,
        children: i.item?.map((j) => {
          return {
            ...j,
            children: j.item?.map((k) => {
              return { ...k, children: k.item };
            }),
          };
        }),
      };
    });
  }, [definition]);

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
