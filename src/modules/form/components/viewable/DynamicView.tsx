import { QueryOptions } from '@apollo/client';
import { Grid, GridProps } from '@mui/material';

import useDynamicFields from '../../hooks/useDynamicFields';
import usePreloadPicklists from '../../hooks/usePreloadPicklists';

import Loading from '@/components/elements/Loading';
import { FormDefinitionJson } from '@/types/gqlTypes';

export interface DynamicViewProps {
  definition: FormDefinitionJson;
  values: Record<string, any>;
  horizontal?: boolean;
  pickListRelationId?: string;
  visible?: boolean;
  picklistQueryOptions?: Omit<QueryOptions, 'query'>;
  GridProps?: GridProps;
}

const DynamicView = ({
  definition,
  values,
  horizontal = false,
  visible = true,
  pickListRelationId,
  picklistQueryOptions,
  GridProps,
}: DynamicViewProps): JSX.Element => {
  const { renderFields } = useDynamicFields({
    definition,
    initialValues: values,
    viewOnly: true,
  });

  const { loading: pickListsLoading } = usePreloadPicklists({
    definition,
    relationId: pickListRelationId,
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
        pickListRelationId,
        visible,
      })}
    </Grid>
  );
};

export default DynamicView;
