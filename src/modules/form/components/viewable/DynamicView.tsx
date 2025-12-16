import { GridProps } from '@mui/material';

import { FormProvider } from 'react-hook-form';
import useFormDefinitionHandlers from '../../hooks/useFormDefinitionHandlers';
import { LocalConstants, PickListArgs } from '../../types';
import DynamicViewFields from './DynamicViewFields';

import Loading from '@/components/elements/Loading';
import DynamicFormLayout, {
  DynamicFormLayoutProps,
} from '@/modules/form/components/DynamicFormLayout';
import { useEnrichedFormData } from '@/modules/form/hooks/rhf/useEnrichedFormData';
import { DynamicFormContext } from '@/modules/form/hooks/useDynamicFormContext';
import { FormDefinitionJson } from '@/types/gqlTypes';

export interface DynamicViewProps {
  definition: FormDefinitionJson;
  horizontal?: boolean;
  visible?: boolean;
  GridProps?: GridProps;
  localConstants?: LocalConstants;
  variant?: DynamicFormLayoutProps['variant'];
}

const DynamicView: React.FC<
  DynamicViewProps & { defaultValues: Record<string, any> }
> = ({
  definition,
  horizontal = false,
  visible = true,
  localConstants = {},
  GridProps,
  variant = 'standard',
  defaultValues,
}): JSX.Element => {
  const handlers = useFormDefinitionHandlers({
    definition,
    defaultValues,
    viewOnly: true,
    localConstants,
  });

  const {
    itemMap,
    viewOnly,
    autofillInvertedDependencyMap,
    disabledDependencyMap,
  } = handlers;
  return (
    <FormProvider {...handlers.methods}>
      <DynamicFormContext.Provider
        value={{
          definition,
          itemMap,
          localConstants,
          viewOnly,
          autofillInvertedDependencyMap,
          disabledDependencyMap,
        }}
      >
        <DynamicFormLayout variant={variant} GridProps={GridProps}>
          <DynamicViewFields
            horizontal={horizontal}
            visible={visible}
            handlers={handlers}
          />
        </DynamicFormLayout>
      </DynamicFormContext.Provider>
    </FormProvider>
  );
};

const DynamicViewEnrichmentLoader: React.FC<
  DynamicViewProps & {
    values: Record<string, any>;
    pickListArgs?: PickListArgs;
  }
> = (props): JSX.Element => {
  const { defaultValues, loading } = useEnrichedFormData({
    pickListArgs: props.pickListArgs,
    definition: props.definition,
    initialValues: props.values,
    localConstants: props.localConstants,
    viewOnly: false,
  });
  if (loading || !defaultValues) {
    return <Loading />;
  }
  return <DynamicView {...props} defaultValues={defaultValues} />;
};

export default DynamicViewEnrichmentLoader;
