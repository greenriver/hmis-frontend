import DataObjectIcon from '@mui/icons-material/DataObject';
import SaveIcon from '@mui/icons-material/Save';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { isEmpty, isEqual } from 'lodash-es';
import pluralize from 'pluralize';
import React, { useEffect, useMemo, useState } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-tomorrow';
import CommonDialog from '@/components/elements/CommonDialog';
import LabeledCheckbox from '@/components/elements/input/LabeledCheckbox';
import LoadingButton from '@/components/elements/LoadingButton';
import usePrevious from '@/hooks/usePrevious';
import DynamicForm from '@/modules/form/components/DynamicForm';
import DynamicView from '@/modules/form/components/viewable/DynamicView';
import {
  AlwaysPresentLocalConstants,
  getInitialValues,
} from '@/modules/form/util/formUtil';
import {
  FormDefinitionJson,
  useGetParsedFormDefinitionQuery,
} from '@/types/gqlTypes';

export interface FormEditorProps {
  definition: object;
  onSave: (defintion: object) => any;
  saveLoading?: boolean;
}

const JsonFormEditor: React.FC<FormEditorProps> = ({
  definition,
  onSave,
  saveLoading = false,
}) => {
  const [open, setOpen] = useState(false);
  const [currentDefinition, setCurrentDefinition] =
    useState<FormDefinitionJson>();
  const [workingDefinition, setWorkingDefinition] =
    useState<object>(definition);
  const [rawValue, setRawValue] = useState<string>(
    JSON.stringify(definition, null, 2)
  );
  const [dirty, setDirty] = useState(false);
  const [formSubmitResult, setFormSubmitResult] = useState<object>();
  const [localConstants, setLocalConstants] = useState<object>({});
  const [initialValues, setInitialValues] = useState<object>({});
  const [readonly, setReadonly] = useState<boolean>(false);
  const [extraPanelOpen, setExtraPanelOpen] = useState(true);
  const [extraPanelTab, setExtraPanelTab] = useState('localConstants');
  const [error, setError] = useState<string>();
  const {
    data,
    loading,
    error: gqlError,
  } = useGetParsedFormDefinitionQuery({
    variables: { input: JSON.stringify(workingDefinition) },
  });

  useEffect(() => {
    if (isEqual(definition, workingDefinition)) {
      setDirty(false);
    }
  }, [definition, workingDefinition]);

  useEffect(() => {
    setWorkingDefinition(definition);
    setRawValue(JSON.stringify(definition, null, 2));
  }, [definition]);

  useEffect(() => {
    if (!dirty && !isEqual(definition, workingDefinition)) setDirty(true);
  }, [definition, workingDefinition, dirty]);

  useEffect(() => {
    if (data?.parsedFormDefinition?.definition)
      setCurrentDefinition(data.parsedFormDefinition.definition);
  }, [data?.parsedFormDefinition?.definition]);

  const effectiveLocalConstants = {
    ...AlwaysPresentLocalConstants,
    ...localConstants,
  };
  const effectiveInitialValues = data?.parsedFormDefinition?.definition
    ? {
        ...getInitialValues(
          data.parsedFormDefinition.definition,
          effectiveLocalConstants
        ),
        ...initialValues,
      }
    : initialValues;

  const allErrors = useMemo(
    () =>
      [
        ...(data?.parsedFormDefinition?.errors || []),
        ...(gqlError ? [gqlError.message] : []),
        ...(error ? [error] : []),
      ].filter((e) => !e.match(/schema invalid/i)),
    [data, gqlError, error]
  );
  const prevAllErrors = usePrevious(allErrors);
  useEffect(() => {
    if (!isEmpty(allErrors) && isEmpty(prevAllErrors))
      setExtraPanelTab('errors');
  }, [allErrors, prevAllErrors]);

  return (
    <>
      <Box
        position='sticky'
        top={64 + 48}
        zIndex={1000}
        component={Paper}
        p={2}
        display='flex'
        justifyContent='space-between'
      >
        <Stack direction='row' gap={4} alignItems='center'>
          <Button
            onClick={() => setOpen(true)}
            variant='outlined'
            startIcon={<DataObjectIcon />}
          >
            Open JSON Editor
          </Button>
          <LabeledCheckbox
            label='View as read-only'
            value={readonly}
            onChange={(e, checked) => setReadonly(checked)}
          />
          {!isEmpty(allErrors) && (
            <Typography color='error'>
              {allErrors.length} {pluralize('Issue', allErrors.length)} must be
              resolved
            </Typography>
          )}
        </Stack>
        <LoadingButton
          startIcon={<SaveIcon />}
          onClick={() => onSave(workingDefinition)}
          disabled={!dirty || loading || !isEmpty(allErrors)}
          loading={saveLoading}
        >
          Save Form Definition
        </LoadingButton>
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
              <Button
                variant={extraPanelTab === 'errors' ? 'contained' : 'outlined'}
                onClick={() => setExtraPanelTab('errors')}
                color={isEmpty(allErrors) ? 'success' : 'error'}
                startIcon={
                  loading ? (
                    <CircularProgress color='inherit' size={15} />
                  ) : undefined
                }
              >
                Issues ({allErrors.length})
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
            {extraPanelTab === 'errors' && (
              <Stack height='200px' width='50vw' gap={1} p={1}>
                {allErrors.map((err) => (
                  <Alert severity='error' key={err}>
                    {err}
                  </Alert>
                ))}
              </Stack>
            )}
          </Collapse>
        </Box>
      </Drawer>
      <Box my={2}>
        {!currentDefinition ? (
          <Skeleton width='100%' height='300px' variant='rounded' />
        ) : readonly ? (
          <DynamicView
            // Using key here will force the form to re-mount when these values change
            key={JSON.stringify({
              effectiveInitialValues,
              effectiveLocalConstants,
            })}
            definition={currentDefinition}
            localConstants={effectiveLocalConstants}
            values={effectiveInitialValues}
          />
        ) : (
          <DynamicForm
            // Using key here will force the form to re-mount when these values change
            key={JSON.stringify({
              effectiveInitialValues,
              effectiveLocalConstants,
            })}
            definition={currentDefinition}
            onSubmit={({ rawValues }) => setFormSubmitResult(rawValues)}
            errors={{ errors: [], warnings: [] }}
            localConstants={effectiveLocalConstants}
            initialValues={effectiveInitialValues}
            FormActionProps={{
              submitButtonText: 'Test Submit Form',
              discardButtonText: 'Discard (unused here)',
              noDiscard: true,
            }}
          />
        )}
      </Box>
      <CommonDialog open={!!formSubmitResult}>
        <DialogTitle>Submitted Values</DialogTitle>
        <DialogContent>
          <Box
            component='pre'
            sx={(theme) => ({
              backgroundColor: theme.palette.grey[100],
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
              p: 2,
              fontSize: theme.typography.body2.fontSize,
            })}
          >
            {JSON.stringify(formSubmitResult, null, 2)}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant='gray' onClick={() => setFormSubmitResult(undefined)}>
            Close
          </Button>
          <Button
            onClick={() => {
              if (formSubmitResult) setInitialValues(formSubmitResult);
              setFormSubmitResult(undefined);
            }}
          >
            Save to Initial Values
          </Button>
        </DialogActions>
      </CommonDialog>
    </>
  );
};

export default JsonFormEditor;
