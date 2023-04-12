import { Box, Grid } from '@mui/material';

import useDynamicViewFields from '../../hooks/useDynamicViewFields';

import { FormDefinitionJson } from '@/types/gqlTypes';

export interface DynamicViewProps {
  definition: FormDefinitionJson;
  loading?: boolean;
  values?: Record<string, any>;
  horizontal?: boolean;
  pickListRelationId?: string;
  visible?: boolean;
}

const DynamicView = ({
  definition,
  // loading,
  values = {},
  horizontal = false,
  visible = true,
  pickListRelationId,
}: DynamicViewProps): JSX.Element => {
  const { renderFields } = useDynamicViewFields({
    definition,
    values,
  });

  return (
    <Box>
      <Grid container direction='column' spacing={2}>
        {renderFields({
          horizontal,
          pickListRelationId,
          visible,
        })}
      </Grid>
    </Box>
  );
};

export default DynamicView;
