import { TreeItem2, UseTreeItem2Parameters } from '@mui/x-tree-view';
import React, { forwardRef } from 'react';
import FormTreeLabel, {
  FormTreeLabelProps,
} from '@/modules/formBuilder/components/formTree/FormTreeLabel';

interface FormTreeItemProps
  extends Omit<UseTreeItem2Parameters, 'rootRef'>,
    Omit<React.HTMLAttributes<HTMLLIElement>, 'onFocus'> {}

const FormTreeItem = forwardRef(function FormTreeItem(
  props: FormTreeItemProps,
  ref: React.Ref<HTMLLIElement>
) {
  const { id, itemId, label, disabled, children } = props;

  return (
    <TreeItem2
      ref={ref}
      {...props}
      slots={{
        label: FormTreeLabel,
      }}
      slotProps={{
        label: {
          id,
          itemId,
          label,
          disabled,
          children,
        } as FormTreeLabelProps,
      }}
    ></TreeItem2>
  );
});

export default FormTreeItem;
