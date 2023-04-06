import { Box, Grid } from '@mui/material';

import useDynamicViewFields from '../../hooks/useDynamicViewFields';

import { FormDefinitionJson } from '@/types/gqlTypes';

export interface DynamicFormProps {
  definition: FormDefinitionJson;
  loading?: boolean;
  values?: Record<string, any>;
  horizontal?: boolean;
  pickListRelationId?: string;
}

const DynamicForm = (
  {
    definition,
    // loading,
    values = {},
    horizontal = false,
    pickListRelationId,
  }: DynamicFormProps,
): JSX.Element => {
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
        })}
      </Grid>
    </Box>
  );
};

export default DynamicForm;
