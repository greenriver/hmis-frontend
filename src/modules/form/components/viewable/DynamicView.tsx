import { Grid, GridProps } from '@mui/material';

import { FormProvider } from 'react-hook-form';
import useFormDefinitionHandlers from '../../hooks/useFormDefinitionHandlers';
import { LocalConstants, PickListArgs } from '../../types';
import DynamicViewFields from './DynamicViewFields';

import { DynamicFormContext } from '@/modules/form/hooks/useDynamicFormContext';
import { FormDefinitionJson } from '@/types/gqlTypes';

export interface DynamicViewProps {
  definition: FormDefinitionJson;
  values: Record<string, any>;
  horizontal?: boolean;
  pickListArgs?: PickListArgs;
  visible?: boolean;
  GridProps?: GridProps;
  localConstants?: LocalConstants;
}

const DynamicView = ({
  definition,
  values,
  horizontal = false,
  visible = true,
  pickListArgs,
  localConstants = {},
  GridProps,
}: DynamicViewProps): JSX.Element => {
  const handlers = useFormDefinitionHandlers({
    definition,
    initialValues: values,
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
        <Grid
          container
          direction='column'
          spacing={2}
          data-testid='dynamicView'
          {...GridProps}
        >
          <DynamicViewFields
            horizontal={horizontal}
            pickListArgs={pickListArgs}
            visible={visible}
            handlers={handlers}
          />
        </Grid>
      </DynamicFormContext.Provider>
    </FormProvider>
  );
};

export default DynamicView;
