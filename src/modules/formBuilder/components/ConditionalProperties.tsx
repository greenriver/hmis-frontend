import { Box, Typography } from '@mui/material';
import EnableWhenSelection, {
  EnableWhenSelectionProps,
} from './EnableWhenSelection';

interface ConditionalPropertiesProps extends EnableWhenSelectionProps {}

const ConditionalProperties: React.FC<ConditionalPropertiesProps> = (props) => {
  return (
    <>
      <Typography variant='h5'>Conditionals</Typography>
      <Box sx={{ mb: 2 }}>
        <EnableWhenSelection {...props} />
      </Box>
    </>
  );
};

export default ConditionalProperties;
