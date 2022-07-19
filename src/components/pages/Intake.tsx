import { Box, Typography } from '@mui/material';
import { useState } from 'react';

import ProjectSelect, {
  ProjectSelectValue,
} from '../elements/input/ProjectSelect';

import ConfiguredApolloProvider from '@/providers/ConfiguredApolloProvider';
const Intake: React.FC = () => {
  const [value, setValue] = useState<ProjectSelectValue>(null);
  return (
    <ConfiguredApolloProvider>
      <Box sx={{ marginLeft: 4, marginTop: 4 }}>
        <Box sx={{ width: 300 }}>
          <ProjectSelect value={value} onChange={setValue} />
          <Typography sx={{ mt: 3 }}>
            Selected: {JSON.stringify(value, null, 2)}
          </Typography>
        </Box>
      </Box>
    </ConfiguredApolloProvider>
  );
};

export default Intake;
