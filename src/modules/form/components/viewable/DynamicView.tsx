import { Grid, GridProps } from '@mui/material';

import useFormDefinitionHandlers from '../../hooks/useFormDefinitionHandlers';
import { LocalConstants, PickListArgs } from '../../types';
import DynamicViewFields from './DynamicViewFields';

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
  const handlers = useFormDefinitionHandlers({
    definition,
    initialValues: values,
    viewOnly: true,
    localConstants,
  });

  return (
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
  );
};

export default DynamicView;
