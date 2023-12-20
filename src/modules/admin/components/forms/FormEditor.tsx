import DataObjectIcon from '@mui/icons-material/DataObject';
import {
  Alert,
  Box,
  Button,
  Collapse,
  Drawer,
  Paper,
  Skeleton,
  Stack,
} from '@mui/material';
import React, { useState } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-tomorrow';
import DynamicForm from '@/modules/form/components/DynamicForm';
import {
  AlwaysPresentLocalConstants,
  getInitialValues,
} from '@/modules/form/util/formUtil';
import { useGetFormDefinitionForJsonQuery } from '@/types/gqlTypes';

export interface FormEditorProps {
  definition: object;
}

const FormEditor: React.FC<FormEditorProps> = ({ definition }) => {
  const [open, setOpen] = useState(false);
  const [workingDefinition, setWorkingDefinition] =
    useState<object>(definition);
  const [rawValue, setRawValue] = useState<string>(
    JSON.stringify(definition, null, 2)
  );
  const [localConstants, setLocalConstants] = useState<object>({});
  const [initialValues, setInitialValues] = useState<object>({
    '2.02.2': 'Test',
  });
  const [extraPanelOpen, setExtraPanelOpen] = useState(true);
  const [extraPanelTab, setExtraPanelTab] = useState('localConstants');
  const [error, setError] = useState<string>();
  const { data, loading } = useGetFormDefinitionForJsonQuery({
    variables: { input: JSON.stringify(workingDefinition) },
  });

  const effectiveLocalConstants = {
    ...AlwaysPresentLocalConstants,
    ...localConstants,
  };
  const effectiveInitialValues = data?.formDefinitionForJson
    ? {
        ...getInitialValues(
          data.formDefinitionForJson,
          effectiveLocalConstants
        ),
        ...initialValues,
      }
    : initialValues;

  return (
    <>
      <Box
        position='sticky'
        top={64 + 48}
        zIndex={1000}
        component={Paper}
        p={2}
      >
        <Button
          onClick={() => setOpen(true)}
          variant='outlined'
          startIcon={<DataObjectIcon />}
        >
          Open JSON Editor
        </Button>
      </Box>
      <Drawer
        anchor='right'
        open={open}
        onClose={() => setOpen((prev) => !prev)}
      >
        <Box
          position='sticky'
          top={0}
          p={1}
          display='flex'
          gap={1}
          zIndex={5}
          justifyContent='space-between'
          sx={(theme) => ({
            borderBottom: `1px solid ${theme.palette.divider}`,
          })}
        >
          <Button onClick={() => setOpen(false)}>Close</Button>
          {error && <Alert severity='error'>{error}</Alert>}
        </Box>
        <AceEditor
          mode='json'
          theme='tomorrow'
          width='50vw'
          height='100%'
          onChange={(val) => {
            setRawValue(val);
            try {
              setWorkingDefinition(JSON.parse(val));
              setError(undefined);
            } catch (err) {
              setError('Invalid Json');
            }
          }}
          name='form-editor'
          wrapEnabled
          tabSize={2}
          debounceChangePeriod={1000}
          value={rawValue}
        />
        <Box
          position='sticky'
          bottom={0}
          zIndex={5}
          sx={(theme) => ({ borderTop: `1px solid ${theme.palette.divider}` })}
        >
          <Stack
            direction='row'
            gap={1}
            p={1}
            justifyContent='space-between'
            sx={(theme) => ({
              borderBottom: `1px solid ${theme.palette.divider}`,
            })}
          >
            <Stack direction='row' gap={1}>
              <Button
                variant={
                  extraPanelTab === 'localConstants' ? 'contained' : 'outlined'
                }
                onClick={() => setExtraPanelTab('localConstants')}
              >
                Local Constants
              </Button>
              <Button
                variant={
                  extraPanelTab === 'initialValues' ? 'contained' : 'outlined'
                }
                onClick={() => setExtraPanelTab('initialValues')}
              >
                Initial Values
              </Button>
            </Stack>
            <Stack direction='row' gap={1}>
              <Button
                variant='gray'
                onClick={() => setExtraPanelOpen((prev) => !prev)}
              >
                {extraPanelOpen ? 'Hide' : 'Show'}
              </Button>
            </Stack>
          </Stack>
          <Collapse in={extraPanelOpen}>
            {extraPanelTab === 'localConstants' && (
              <AceEditor
                mode='json'
                theme='tomorrow'
                width='100%'
                height='200px'
                onChange={(val) => setLocalConstants(JSON.parse(val))}
                name='form-editor'
                wrapEnabled
                tabSize={2}
                debounceChangePeriod={1000}
                value={JSON.stringify(localConstants, null, 2)}
              />
            )}
            {extraPanelTab === 'initialValues' && (
              <AceEditor
                mode='json'
                theme='tomorrow'
                width='100%'
                height='200px'
                onChange={(val) => setInitialValues(JSON.parse(val))}
                name='form-editor'
                wrapEnabled
                tabSize={2}
                debounceChangePeriod={1000}
                value={JSON.stringify(initialValues, null, 2)}
              />
            )}
          </Collapse>
        </Box>
      </Drawer>
      <Box my={2}>
        {loading ? (
          <Skeleton width='100%' height='300px' variant='rounded' />
        ) : (
          data?.formDefinitionForJson && (
            <DynamicForm
              // Using key here will force the form to re-mount when these values change
              key={JSON.stringify({
                effectiveInitialValues,
                effectiveLocalConstants,
              })}
              definition={data.formDefinitionForJson}
              onSubmit={({ values }) => setInitialValues(values)}
              errors={{ errors: [], warnings: [] }}
              localConstants={effectiveLocalConstants}
              initialValues={effectiveInitialValues}
            />
          )
        )}
      </Box>
    </>
  );
};

export default FormEditor;
