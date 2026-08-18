import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import {
  Alert,
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { isEmpty, isEqual } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import FormJsonPanel from './FormJsonPanel';
import LoadingButton from '@/components/elements/LoadingButton';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { ErrorState } from '@/modules/errors/util';
import { useGetParsedFormDefinitionQuery } from '@/types/gqlTypes';

interface Props {
  open: boolean;
  rawDefinition: object;
  onClose: () => void;
  onSave: (definition: object) => void;
  saveLoading?: boolean;
  saveErrorState?: ErrorState;
  onDirtyChange?: (dirty: boolean) => void;
  onWorkingDefinitionChange?: (definition: object) => void;
}

const stringifyDefinition = (definition: object) =>
  JSON.stringify(definition, null, 2);

const FormJsonEditorDrawer: React.FC<Props> = ({
  open,
  rawDefinition,
  onClose,
  onSave,
  saveLoading = false,
  saveErrorState,
  onDirtyChange,
  onWorkingDefinitionChange,
}) => {
  const [workingDefinition, setWorkingDefinition] =
    useState<object>(rawDefinition);
  const [rawValue, setRawValue] = useState<string>(
    stringifyDefinition(rawDefinition)
  );
  const [parseError, setParseError] = useState<string>();

  const resetEditor = useCallback(() => {
    setWorkingDefinition(rawDefinition);
    setRawValue(stringifyDefinition(rawDefinition));
    setParseError(undefined);
  }, [rawDefinition]);

  useEffect(() => {
    resetEditor();
  }, [resetEditor]);

  const dirty = useMemo(
    () => rawValue !== stringifyDefinition(rawDefinition),
    [rawDefinition, rawValue]
  );

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    onWorkingDefinitionChange?.(workingDefinition);
  }, [onWorkingDefinitionChange, workingDefinition]);

  // Debounce parsed JSON so we don't validate on every keystroke, but still
  // treat in-progress edits as "validating" immediately.
  useEffect(() => {
    if (parseError || !dirty) return;
    const timeout = window.setTimeout(() => {
      try {
        setWorkingDefinition(JSON.parse(rawValue));
      } catch {
        setParseError('Invalid Json');
      }
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [rawValue, parseError, dirty]);

  const {
    data,
    loading: parseLoading,
    error: gqlError,
  } = useGetParsedFormDefinitionQuery({
    variables: { input: JSON.stringify(workingDefinition) },
    skip: !open || !dirty || !!parseError,
    notifyOnNetworkStatusChange: true,
  });

  const validating = useMemo(() => {
    if (!dirty || parseError) return false;
    try {
      const parsed = JSON.parse(rawValue);
      return parseLoading || !isEqual(parsed, workingDefinition);
    } catch {
      return false;
    }
  }, [dirty, parseError, parseLoading, rawValue, workingDefinition]);

  const parseErrors = useMemo(() => {
    const clientErrors = parseError ? [parseError] : [];
    const serverErrors =
      dirty && !validating
        ? [
            ...(data?.parsedFormDefinition?.errors || []),
            ...(gqlError ? [gqlError.message] : []),
          ]
        : [];
    return [...serverErrors, ...clientErrors].filter(
      (e) => !e.match(/schema invalid/i)
    );
  }, [data, dirty, gqlError, parseError, validating]);

  const canSave = dirty && !validating && isEmpty(parseErrors);

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          borderTop: 'none',
          width: '50vw',
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        px={2}
        py={1}
        flexShrink={0}
        sx={(theme) => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
        })}
      >
        <Typography component='h2' variant='h5'>
          Form JSON
        </Typography>
        <IconButton
          aria-label='close'
          onClick={onClose}
          sx={{ color: 'grayscale.light' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Box flex={1} minHeight={0}>
        <FormJsonPanel
          value={rawValue}
          readOnly={false}
          onChange={(val) => {
            setRawValue(val);
            try {
              JSON.parse(val);
              setParseError(undefined);
            } catch {
              setParseError('Invalid Json');
            }
          }}
        />
      </Box>
      {dirty && (
        <Stack
          gap={2}
          p={2}
          flexShrink={0}
          sx={(theme) => ({
            borderTop: `1px solid ${theme.palette.divider}`,
          })}
        >
          {(!isEmpty(parseErrors) ||
            (saveErrorState?.errors && saveErrorState.errors.length > 0)) && (
            <Stack gap={1} maxHeight='20vh' overflow='auto'>
              {saveErrorState?.errors && saveErrorState.errors.length > 0 && (
                <ErrorAlert errors={saveErrorState.errors} />
              )}
              {parseErrors.map((err) => (
                <Alert severity='error' key={err}>
                  {err}
                </Alert>
              ))}
            </Stack>
          )}
          <Stack direction='row' justifyContent='end' gap={2}>
            <Button type='button' color='grayscale' onClick={resetEditor}>
              Discard Changes
            </Button>
            <LoadingButton
              type='button'
              variant='contained'
              startIcon={<SaveIcon />}
              onClick={() => onSave(workingDefinition)}
              disabled={!canSave}
              loading={saveLoading || validating}
              sx={{ px: 4 }}
            >
              Save Draft
            </LoadingButton>
          </Stack>
        </Stack>
      )}
    </Drawer>
  );
};

export default FormJsonEditorDrawer;
