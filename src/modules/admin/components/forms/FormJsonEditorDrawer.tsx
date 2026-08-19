import SaveIcon from '@mui/icons-material/Save';
import { Alert, Button, Stack } from '@mui/material';
import { isEmpty } from 'lodash-es';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import FormJsonDrawer from './FormJsonDrawer';
import LoadingButton from '@/components/elements/LoadingButton';
import ApolloErrorAlert from '@/modules/errors/components/ApolloErrorAlert';
import ErrorAlert from '@/modules/errors/components/ErrorAlert';
import { ErrorState, hasErrors } from '@/modules/errors/util';
import { stringifyJson } from '@/modules/formBuilder/formBuilderUtil';
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
    stringifyJson(rawDefinition)
  );
  const [parseError, setParseError] = useState<string>();

  const resetEditor = useCallback(() => {
    setWorkingDefinition(rawDefinition);
    setRawValue(stringifyJson(rawDefinition));
    setParseError(undefined);
  }, [rawDefinition]);

  // Reset the editor when rawDefinition is a new object (e.g. after a successful save)
  useEffect(() => {
    resetEditor();
  }, [resetEditor]);

  const dirty = useMemo(
    () => rawValue !== stringifyJson(rawDefinition),
    [rawDefinition, rawValue]
  );

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    onWorkingDefinitionChange?.(workingDefinition);
  }, [onWorkingDefinitionChange, workingDefinition]);

  // Debounce parsed JSON so we don't validate on every keystroke.
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

  const parseErrors = useMemo(() => {
    const clientErrors = parseError ? [parseError] : [];
    const serverErrors =
      dirty && !parseLoading ? data?.parsedFormDefinition?.errors || [] : [];
    return [...serverErrors, ...clientErrors].filter(
      (e) => !e.match(/schema invalid/i)
    );
  }, [data, dirty, parseError, parseLoading]);

  const showParseApolloError = dirty && !parseLoading && !!gqlError;
  const showSaveErrors = !!saveErrorState && hasErrors(saveErrorState);
  const canSave = dirty && !parseLoading && isEmpty(parseErrors) && !gqlError;

  const handleChange = (val: string) => {
    setRawValue(val);
    try {
      JSON.parse(val);
      setParseError(undefined);
    } catch {
      setParseError('Invalid Json');
    }
  };

  const footer = useMemo(() => {
    if (!dirty) return;

    return (
      <Stack
        gap={2}
        p={2}
        flexShrink={0}
        sx={(theme) => ({
          borderTop: `1px solid ${theme.palette.divider}`,
        })}
      >
        {(!isEmpty(parseErrors) || showSaveErrors || showParseApolloError) && (
          <Stack gap={1} maxHeight='20vh' overflow='auto'>
            {showSaveErrors && (
              <>
                <ApolloErrorAlert error={saveErrorState.apolloError} inline />
                <ErrorAlert errors={saveErrorState.errors} />
              </>
            )}
            {showParseApolloError && (
              <ApolloErrorAlert error={gqlError} inline />
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
            loading={saveLoading || parseLoading}
            sx={{ px: 4 }}
          >
            Save Draft
          </LoadingButton>
        </Stack>
      </Stack>
    );
  }, [
    canSave,
    dirty,
    gqlError,
    onSave,
    parseErrors,
    parseLoading,
    resetEditor,
    saveErrorState,
    saveLoading,
    showParseApolloError,
    showSaveErrors,
    workingDefinition,
  ]);

  return (
    <FormJsonDrawer
      open={open}
      onClose={onClose}
      jsonString={rawValue}
      readOnly={false}
      onChange={handleChange}
      footer={footer}
    />
  );
};

export default FormJsonEditorDrawer;
