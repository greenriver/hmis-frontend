import { Grid, GridProps } from '@mui/material';

import useDynamicFields from '../../hooks/useDynamicFields';
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
  const { renderFields } = useDynamicFields({
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
      {renderFields({
        horizontal,
        pickListArgs,
        visible,
      })}
    </Grid>
  );
};

export default DynamicView;
