import { Grid } from '@mui/material';

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
}

const DynamicView = ({
  definition,
  values,
  horizontal = false,
  visible = true,
  pickListRelationId,
}: DynamicViewProps): JSX.Element => {
  const { renderFields } = useDynamicFields({
    definition,
    initialValues: values,
    viewOnly: true,
  });

  const { loading: pickListsLoading } = usePreloadPicklists(
    definition,
    pickListRelationId
  );

  if (pickListsLoading) return <Loading />;

  return (
    <Grid container direction='column' spacing={2} data-testid='dynamicView'>
      {renderFields({
        horizontal,
        pickListRelationId,
        visible,
      })}
    </Grid>
  );
};

export default DynamicView;
