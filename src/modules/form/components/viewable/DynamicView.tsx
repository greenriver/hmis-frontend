import { QueryOptions } from '@apollo/client';
import { Grid, GridProps } from '@mui/material';

import useDynamicFields from '../../hooks/useDynamicFields';
import usePreloadPicklists from '../../hooks/usePreloadPicklists';
import { LocalConstants, PickListArgs } from '../../types';

import Loading from '@/components/elements/Loading';
import { FormDefinitionJson } from '@/types/gqlTypes';

export interface DynamicViewProps {
  definition: FormDefinitionJson;
  values: Record<string, any>;
  horizontal?: boolean;
  pickListArgs?: PickListArgs;
  visible?: boolean;
  picklistQueryOptions?: Omit<QueryOptions, 'query'>;
  GridProps?: GridProps;
  localConstants?: LocalConstants;
}

const DynamicView = ({
  definition,
  values,
  horizontal = false,
  visible = true,
  pickListArgs,
  picklistQueryOptions,
  localConstants,
  GridProps,
}: DynamicViewProps): JSX.Element => {
  const { renderFields } = useDynamicFields({
    definition,
    initialValues: values,
    viewOnly: true,
    localConstants,
  });

  const { loading: pickListsLoading } = usePreloadPicklists({
    definition,
    pickListArgs,
    queryOptions: picklistQueryOptions,
  });

  if (pickListsLoading) return <Loading />;

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
