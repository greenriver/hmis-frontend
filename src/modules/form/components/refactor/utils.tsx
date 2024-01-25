import { isEmpty } from 'lodash-es';
import { ReactNode } from 'react';

import AutofillFormItemWrapper from './AutofillFormItemWrapper';
import DependentFormItemWrapper from './DependentFormItemWrapper';
import { FormDefinitionHandlers } from './useFormDefinitionHandlers';

import { FormItem } from '@/types/gqlTypes';

export const renderItemWithWrappers = (
  renderChild: (disabled?: boolean) => ReactNode,
  item: FormItem,
  handlers: FormDefinitionHandlers
) => {
  const { disabledDependencyMap, autofillInvertedDependencyMap } = handlers;

  if (item.hidden) return null;

  const hasDependencies =
    disabledDependencyMap[item.linkId] ||
    !isEmpty(item.enableWhen) ||
    item.item?.every((item) => item.enableWhen);
  const hasAutofill =
    autofillInvertedDependencyMap[item.linkId] || !isEmpty(item.autofillValues);

  if (hasDependencies && hasAutofill) {
    return (
      <DependentFormItemWrapper handlers={handlers} item={item}>
        {(disabled) => (
          <AutofillFormItemWrapper handlers={handlers} item={item}>
            {() => renderChild(disabled)}
          </AutofillFormItemWrapper>
        )}
      </DependentFormItemWrapper>
    );
  }

  if (hasDependencies) {
    return (
      <DependentFormItemWrapper handlers={handlers} item={item}>
        {renderChild}
      </DependentFormItemWrapper>
    );
  }

  if (hasAutofill) {
    return (
      <AutofillFormItemWrapper handlers={handlers} item={item}>
        {() => renderChild()}
      </AutofillFormItemWrapper>
    );
  }

  return renderChild();
};
