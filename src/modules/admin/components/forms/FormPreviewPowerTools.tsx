import { Box, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';
import FormJsonPanel from './FormJsonPanel';
import SimpleAccordion from '@/components/elements/SimpleAccordion';

interface Props {
  localConstants: object;
  initialValues: object;
  onLocalConstantsChange: (value: object) => void;
  onInitialValuesChange: (value: object) => void;
}

const tryParseJson = (value: string): object | undefined => {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
};

const FormPreviewPowerTools: React.FC<Props> = ({
  localConstants,
  initialValues,
  onLocalConstantsChange,
  onInitialValuesChange,
}) => {
  const [localConstantsJson, setLocalConstantsJson] = useState(
    JSON.stringify(localConstants, null, 2)
  );
  const [initialValuesJson, setInitialValuesJson] = useState(
    JSON.stringify(initialValues, null, 2)
  );

  return (
    <Box sx={{ mb: 3 }}>
      <SimpleAccordion
        renderContent={(content) => content}
        items={[
          {
            key: 'form-preview-power-tools',
            header: 'Power Tools',
            defaultExpanded: false,
            content: (
              <Stack direction={{ xs: 'column', md: 'row' }} gap={2}>
                <Box flex={1}>
                  <Typography variant='body2' sx={{ mb: 1 }}>
                    Local Constants
                  </Typography>
                  <FormJsonPanel
                    name='form-preview-local-constants'
                    value={localConstantsJson}
                    readOnly={false}
                    height='200px'
                    debounceChangePeriod={1000}
                    onChange={(val) => {
                      setLocalConstantsJson(val);
                      const parsed = tryParseJson(val);
                      if (parsed) onLocalConstantsChange(parsed);
                    }}
                  />
                </Box>
                <Box flex={1}>
                  <Typography variant='body2' sx={{ mb: 1 }}>
                    Initial Values
                  </Typography>
                  <FormJsonPanel
                    name='form-preview-initial-values'
                    value={initialValuesJson}
                    readOnly={false}
                    height='200px'
                    debounceChangePeriod={1000}
                    onChange={(val) => {
                      setInitialValuesJson(val);
                      const parsed = tryParseJson(val);
                      if (parsed) onInitialValuesChange(parsed);
                    }}
                  />
                </Box>
              </Stack>
            ),
          },
        ]}
      />
    </Box>
  );
};

export default FormPreviewPowerTools;
