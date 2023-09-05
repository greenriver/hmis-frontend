import { Grid, GridProps } from '@mui/material';
import { useContext, useEffect } from 'react';

import useDynamicFields from '../../hooks/useDynamicFields';
import { FormStepperDispatchContext } from '../../hooks/useFormStepperContext';
import { LocalConstants, PickListArgs } from '../../types';

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
  localConstants,
  GridProps,
}: DynamicViewProps): JSX.Element => {
  const { renderFields, getCleanedValues } = useDynamicFields({
    definition,
    initialValues: values,
    viewOnly: true,
    localConstants,
  });

  const formStepperDispatch = useContext(FormStepperDispatchContext);

  // Initialize the form stepper with the initial values
  useEffect(() => {
    formStepperDispatch({ type: 'updateValues', values: getCleanedValues() });
  }, [formStepperDispatch, getCleanedValues]);

  return (
    <Grid
      container
      direction='column'
      spacing={2}
      data-testid='dynamicView'
      {...GridProps}
    >
      {renderFields({
        horizontal,
        pickListArgs,
        visible,
      })}
    </Grid>
  );
};

export default DynamicView;
